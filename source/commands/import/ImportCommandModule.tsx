import { ArgumentsCamelCase, CommandModule } from 'yargs';
import { render } from 'ink';
import ImportCommand, { ImportCommandProps } from './ImportCommand.js';
import React from 'react';

export default class ImportCommandModule<U extends ImportCommandProps> implements CommandModule<{}, U> {
  public command = 'import'
  public describe = `Import discographies from a Blogger's XML.`
  public builder = {
    file: {
      string: true,
      demandOption: true,
      alias: 'f',
      describe: 'Path of the file to import.'
    }
  }

  public handler(argv: ArgumentsCamelCase<U>) {
    render(<ImportCommand {...argv} />)
  }
}