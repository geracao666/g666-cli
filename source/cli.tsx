#!/usr/bin/env node
import 'dotenv/config'
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import importCommandModule from './commands/import/index.js';

yargs(hideBin(process.argv))
	.scriptName('g666')
	.usage('$0 <command>')
	.command(importCommandModule)
	.demandCommand()
	.help()
	.parse()
