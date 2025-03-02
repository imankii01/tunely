#!/usr/bin/env node
const { program } = require('commander');
const axios = require('axios');
const fs = require('fs');
const ini = require('ini');
const { spawn } = require('child_process');
const os = require('os');

const configDir = `${os.homedir()}/.tunely`;
const configFile = `${configDir}/config.json`;

if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);
let config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile)) : {};

program
  .command('authtoken <token>')
  .description('Save authentication token')
  .action((token) => {
    config.token = token;
    fs.writeFileSync(configFile, JSON.stringify(config));
    console.log('Token saved');
  });

program
  .command('http <port>')
  .description('Expose local HTTP server')
  .action(async (port) => {
    if (!config.token) {
      console.error('Please set token with: tunely authtoken <token>');
      return;
    }

    const res = await axios.post('https://api.tunely.snapstay.in/api/tunnel', { token: config.token });
    const subdomain = res.data.subdomain.split('.')[0];

    const frpcConfig = {
      common: {
        server_addr: 'tunely.snapstay.in',
        server_port: 7000,
        token: 'your_global_frp_token',
      },
      [`http_${port}`]: {
        type: 'http',
        local_port: port,
        subdomain,
      },
    };
    fs.writeFileSync('frpc.ini', ini.stringify(frpcConfig));

    const frpc = spawn('frpc', ['-c', 'frpc.ini'], { stdio: 'inherit' });
    console.log(`Exposing http://localhost:${port} at https://${subdomain}.tunely.snapstay.in`);
  });

program.parse(process.argv);