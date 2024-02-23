import React from 'react';
import { Box, Text } from 'ink';
import { ImportCommandProps } from './types.js';

export default function ImportCommand({ file, artists, status }: ImportCommandProps) {
  const importedArtists = artists.filter(({ status }) => status === 'done')
  const failedArtists = artists.filter(({ status }) => status === 'error')
  const lastFailedArtist = failedArtists.at(-1)
  const lastImportedArtistIndex = artists.findLastIndex(({ status }) => status === 'done' || status === 'error')
  const importingArtist = artists.at(lastImportedArtistIndex === -1 ? 0 : lastImportedArtistIndex + 1)

	return (
		<Box flexDirection="column" margin={1}>
      <Box flexDirection="column">
        <Box>
          <Text inverse>IMPORT FILE</Text>
          <Text>&nbsp;{file}</Text>
        </Box>

        <Box>
          <Text inverse>LOADING</Text>
          <Text>&nbsp;{artists.length} artists found.</Text>
        </Box>
      </Box>

      {status !== 'loading' && (
        <Box flexDirection="column" marginY={1}>
          <Box flexDirection="column">
            <Box>
              <Text color="cyanBright" inverse>IMPORTING</Text>
              <Text color="cyanBright">&nbsp;{importedArtists.length}/{artists.length} discographies imported.</Text>
            </Box>

            {failedArtists.length > 0 && (
              <Box>
                <Text color="redBright" inverse>ERROR</Text>
                <Text color="redBright">&nbsp;{failedArtists.length} imports failed.</Text>
              </Box>
            )}

            {lastFailedArtist && (
              <Box>
                <Text color="redBright" inverse>ERROR MESSAGE</Text>
                <Text color="redBright">&nbsp;{lastFailedArtist.errorMessage}</Text>
              </Box>
            )}

            {importingArtist && (
              <Box marginTop={1}>
                <Text>Importing "{importingArtist.payload.name}" discography...</Text>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {status === 'done' && (
        <Box>
          <Text color="green" inverse>IMPORT COMPLETED</Text>
        </Box>
      )}
    </Box>
	);
}