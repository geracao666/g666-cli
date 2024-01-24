#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { ImportCommandModule } from './commands/ImportCommand.js';

yargs(hideBin(process.argv))
	.scriptName('g666')
	.usage('$0 <command>')
	.command(new ImportCommandModule())
	.demandCommand()
	.help()
	.parse()
