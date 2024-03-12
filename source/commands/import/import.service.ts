import { Artist, ArtistImport, EntryTag, XMLCategoryElement } from "./types.js"
import { parse as parseHTML } from 'node-html-parser'
import fs from 'node:fs/promises'
import xmlFlow from "xml-flow"
import * as R from 'ramda'
import { sleep } from "../../utils/time.js"
import api from "../../api/index.js"
import got, { RequestError } from "got"

/**
 * Load artists from an XML file.
 */
export const loadArtists = async (
  file: string,
  limit: number,
  filter: string,
  onUpdateArtists: (artists: ArtistImport[]) => void
) => {
  const fileHandle = await fs.open(file, 'r')
  const reader = fileHandle.createReadStream({ autoClose: true })
  const xmlStream = xmlFlow(reader)
  const artists: ArtistImport[] = []

  return new Promise<ArtistImport[]>((resolve) => {
    xmlStream.on('tag:entry', (entry: EntryTag) => {
      if (limit !== -1 && artists.length === limit) {
        reader.close()
        return resolve(artists)
      }

      const artist = extractArtist(entry)
      if (!artist) {
        return
      }

      const re = new RegExp(filter, 'i')
      if (artist.name.match(re)) {
        artists.push({ status: 'queued', payload: artist })
        onUpdateArtists(artists)
      }
    })

    xmlStream.on('end', () => resolve(artists))
  })
}

/**
 * Import an artist using the G666 Admin API.
 */
export const importArtist = async (
  artistImport: ArtistImport,
  { timeout = 1000 }: { timeout?: number } = {}
) => {
  try {
    const { payload: artist } = artistImport
    const images = await Promise.allSettled([
      got(artist.cover, { encoding: 'base64' }).text(),
      ...artist.releases.map(
        (release) => got(release.artwork, { encoding: 'base64' }).text()
      )
    ])

    const [cover, ...artworks] = images.map(
      (result: PromiseSettledResult<string>) =>
        result.status === 'fulfilled'
          ? result.value
          : ''
    )

    const payload: Artist = {
      ...artist,
      ...(cover && { cover }),
      releases: artist.releases.map((release, index) => ({
        ...release,
        artwork: artworks[index] ?? ''
      }))
    }

    await api.post<Artist>('artist/import', { json: payload }).json()
    await sleep(timeout)

    artistImport.status = 'done'
  } catch (err) {
    if (err instanceof RequestError) {
      artistImport.status = 'error'
      artistImport.errorMessage = err.message
      return
    }

    throw err
  }
}

/**
 * Extract artist from an XML entry tag.
 */
const extractArtist = (entry: EntryTag): Artist | null => {
  const artistName = entry.title.$text
  const isArtist = R.is(Array, entry.category)
    ? !!R.find(({ term }: XMLCategoryElement) => term === artistName, entry.category)
    : entry.category.term === artistName

  if (!isArtist) {
    return null
  }

  const rawTags = R.is(Array, entry.category) ? R.pluck('term', entry.category) : [entry.category.term]
  const [origin, tags] = R.pipe(
    R.filter((tag: string) => !tag.startsWith('http://') && tag !== artistName),
    R.partition(R.startsWith('*'))
  )(rawTags)

  const html = parseHTML(entry.content.$text)
  const coverUrl = html.querySelector('img')?.getAttribute('src') as string
  const releases = R.pipe(
    R.split('- DISCOGRAFIA -'),
    R.nth(1),
    R.defaultTo(''),
    R.split(/([&gt;]+Download[&lt;]+<\/[a|div]+>)/i),
    R.splitEvery(2),
    R.map(R.join('')),
    R.chain((chunk) => {
      const parsedChunk = parseHTML(chunk)
      const [unhandledName, ...unhandledTracks] = R.split('\n', parsedChunk.structuredText)

      if (!unhandledName) {
        return []
      }

      const name = R.trim(unhandledName)
      const tracks = R.pipe(
        R.map(R.trim),
        R.filter(R.test(/^\d+\s-/)),
        R.groupWith((_, b) => !b.startsWith('01 -')),
        R.map(
          R.map(
            R.pipe(
              R.split(/^\d+\s-/),
              R.nth(1),
              R.defaultTo(''),
              R.trim
            )
          )
        )
      )(unhandledTracks)

      const artwork = parsedChunk.querySelector('img')?.getAttribute('src') as string
      const downloadUrl = parsedChunk
        .querySelector('a[href^=https://drive.google.com], a[href^=http://www.4shared.com]')
        ?.getAttribute('href') ?? null

      return [{ type: 'album', name, tracks, artwork, downloadUrl }]
    })
  )(html.innerHTML)

  return {
    name: artistName,
    origin: R.replace('* ', '', origin.at(0) ?? ''),
    tags: R.map(R.pipe(R.toLower, R.replace('# ', '')), tags),
    cover: coverUrl,
    releases
  }
}