import React from 'react';
import {Text, render} from 'ink';
import { ArgumentsCamelCase, CommandModule } from 'yargs';

type ImportCommandProps = {
  file: string
};

const ImportCommand = ({file}: ImportCommandProps) => {
	return (
		<Text>
			Importando: {file}
		</Text>
	);
}

export class ImportCommandModule<U extends ImportCommandProps> implements CommandModule<{}, U> {
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