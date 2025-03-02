const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const configDir = path.join(os.homedir(), '.tunely');
const configFile = path.join(configDir, 'config.json');

const ensureConfigDir = () => {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
};

const saveToken = (token) => {
  ensureConfigDir();
  const config = { token };
  fs.writeJsonSync(configFile, config, { spaces: 2 });
  console.log('Token saved successfully');
};

const getConfig = () => {
  ensureConfigDir();
  if (fs.existsSync(configFile)) {
    return fs.readJsonSync(configFile);
  }
  return {};
};

module.exports = { saveToken, getConfig };