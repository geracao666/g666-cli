import React, { useEffect, useState } from 'react';
import {Box, Static, Text } from 'ink';
import fs from 'node:fs/promises'
import xmlFlow from 'xml-flow'
import * as R from 'ramda'

export type ImportCommandProps = {
  file: string
};

type Artist = {
  name: string;
  origin: string;
  tags: string[]
}

export default function ImportCommand({file}: ImportCommandProps) {  
  const [artists, setArtists] = useState<Artist[]>([])

  useEffect(() => {
    fs.open(file, 'r').then((fileHandle) => {
      const reader = fileHandle.createReadStream({ autoClose: true })
      const xmlStream = xmlFlow(reader)

      xmlStream.on('tag:entry', (entry: any) => {
        const artistName = entry.title.$text
        const isArtist = R.is(Array, entry.category)
          ? !!R.find(({ term }: { term: string }) => term === artistName, entry.category)
          : entry.category.term === artistName

        const rawTags = R.is(Array, entry.category) ? R.pluck('term', entry.category) : [entry.category.term]
        const [origin, tags] = R.pipe(
          R.filter((tag: string) => !tag.startsWith('http://') && tag !== artistName),
          R.partition(R.startsWith('*'))
        )(rawTags)

        const artist = {
          name: artistName,
          origin: R.replace('* ', '', origin.at(0) ?? ''),
          tags: R.map(R.pipe(
            R.toLower,
            R.replace('# ', '')
          ), tags)
        }

        isArtist && setArtists((currentArtists) => [...currentArtists, artist])
      })
    })
  }, [file])

	return (
		<Static items={artists}>
      {artist => (
        <Box marginBottom={1}>
          <Text>{JSON.stringify(artist)}</Text>
        </Box>
      )}      
		</Static>
	);
}