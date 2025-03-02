const path = require('path');
const os = require('os');

const getFrpcPath = () => {
  const platform = os.platform();
  const cliDir = path.dirname(__dirname);

  switch (platform) {
    case 'linux':
      return path.join(cliDir, 'frpc-linux');
    case 'darwin':
      return path.join(cliDir, 'frpc-mac');
    case 'win32':
      return path.join(cliDir, 'frpc-windows.exe');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

module.exports = { getFrpcPath };