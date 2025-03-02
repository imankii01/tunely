#!/usr/bin/env node
const { program } = require('commander');
const { saveToken } = require('../lib/config');
const { createHttpTunnel } = require('../lib/tunnel');

program
  .version('1.0.0')
  .description('Tunely CLI - Expose your local server to the internet');

program
  .command('authtoken <token>')
  .description('Save your authentication token')
  .action(saveToken); // Fixed: Removed extra parenthesis and corrected syntax

program
  .command('http <port>')
  .description('Expose a local HTTP server on the specified port')
  .action(createHttpTunnel);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}