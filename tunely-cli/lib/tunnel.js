const axios = require('axios');
const fs = require('fs-extra');
const ini = require('ini');
const { spawn } = require('child_process');
const path = require('path');
const { getConfig } = require('./config');
const { getFrpcPath } = require('./utils');

const createHttpTunnel = async (port) => {
  const config = getConfig();
  if (!config.token) {
    console.error('No token found. Please run: tunely authtoken <token>');
    process.exit(1);
  }

  try {
    const response = await axios.post('https://api.tunely.snapstay.in/api/tunnel', {}, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    const subdomain = response.data.subdomain.split('.')[0];

    const frpcConfig = {
      common: {
        server_addr: 'tunely.snapstay.in',
        server_port: 7000,
        token: 'your_global_frp_token', // Replace with your frp server token
      },
      [`http_${port}`]: {
        type: 'http',
        local_port: port,
        subdomain,
      },
    };

    const configPath = path.join(process.cwd(), 'frpc.ini');
    fs.writeFileSync(configPath, ini.stringify(frpcConfig));

    const frpcPath = getFrpcPath();
    if (!fs.existsSync(frpcPath)) {
      console.error('frpc binary not found. Please place it in the CLI directory.');
      process.exit(1);
    }

    const frpc = spawn(frpcPath, ['-c', configPath], { stdio: 'inherit' });
    console.log(`Exposing http://localhost:${port} at https://${subdomain}.tunely.snapstay.in`);

    frpc.on('error', (err) => {
      console.error('Failed to start frpc:', err.message);
    });

    frpc.on('exit', (code) => {
      if (code !== 0) {
        console.error(`frpc exited with code ${code}`);
      }
      fs.removeSync(configPath);
    });
  } catch (error) {
    console.error('Error creating tunnel:', error.response?.data?.message || error.message);
    process.exit(1);
  }
};

module.exports = { createHttpTunnel };