import { CommandModule } from "yargs"
import { ArtistImport, ImportCommandArgs } from "./types.js"
import { importArtist, loadArtists } from "./import.service.js"
import { render } from "ink"
import ImportCommand from "./ImportCommand.js"
import React from "react"

const importCommandModule: CommandModule<{}, ImportCommandArgs> = {
  command: 'import',
  describe: `Import discographies from a Blogger's XML.`,
  builder: {
    file: {
      string: true,
      demandOption: true,
      alias: 'f',
      describe: 'Path of the file to import.'
    },

    limit: {
      number: true,
      default: -1,
      alias: 'l',
      describe: 'Limit the number of discographies imported.'
    },

    timeout: {
      number: true,
      default: 1000,
      alias: 't',
      describe: 'Timeout between each request in milliseconds.'
    },

    filter: {
      string: true,
      describe: 'Filter for matching artists.'
    }
  },

  async handler(argv: ImportCommandArgs) {
    const artists = await loadArtists(argv.file, argv.limit, argv.filter, (artists: ArtistImport[]) => {
      render(<ImportCommand file={argv.file} artists={artists} status="loading" />)
    })

    for (const artist of artists) {
      render(<ImportCommand file={argv.file} artists={artists} status="importing" />)
      await importArtist(artist, { timeout: argv.timeout })
    }

    render(<ImportCommand file={argv.file} artists={artists} status="done" />)
  }
}

export default importCommandModule