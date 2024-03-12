import { Arguments } from "yargs";

export type ImportCommandArgs = Arguments & {
  file: string
  limit: number
  timeout: number
  filter: string
}

export type ImportCommandProps = {
  file: string
  artists: ArtistImport[]
  status: 'loading' | 'importing' | 'done'
};

export type ArtistImport = {
  payload: Artist
  status: 'queued' | 'done' | 'error'
  errorMessage?: string
}

export type Artist = {
  name: string
  origin: string
  cover: string
  tags: string[]
  releases: Release[]
}

export type Release = {
  type: string
  name: string
  artwork: string
  downloadUrl: string | null
  tracks:  string[][]
}

export type EntryTag = {
  title: XMLElement
  content: XMLElement
  category: XMLCategoryElement | XMLCategoryElement[]
}

export type XMLElement = {
  $text: string
}

export type XMLCategoryElement = XMLElement & { term: string }