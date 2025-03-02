
The Tunely CLI is a Node.js-based command-line tool that allows users to expose their local servers to the internet via the Tunely service. It communicates with the Tunely backend API to generate subdomains and uses the frp (Fast Reverse Proxy) client to create secure tunnels.

## Features
- **Token Management**: Save your authentication token locally for easy access.
- **Tunneling**: Expose a local HTTP server with a single command (e.g., `tunely http 3000`).
- **Cross-Platform**: Works on Linux, macOS, and Windows with platform-specific frpc binaries.
- **User-Friendly**: Simple commands and clear error messages.

## Prerequisites
Before using the CLI, ensure you have:
- **Node.js** and **npm** installed on your machine (download from [nodejs.org](https://nodejs.org/)).
- **frp Client (frpc)** binaries downloaded from [frp releases](https://github.com/fatedier/frp/releases)).
- A token from the Tunely frontend (`https://app.tunely.snapstay.in`) via login or registration.

## Setup Instructions
Follow these steps to set up and use the CLI:

### Installing the CLI
1. **Install Globally** (after publishing or for testing):
   - If published to npm:
     ```bash
     npm install -g tunely
     ```
   - For local testing (see Development section):
     ```bash
     npm link
     ```

2. **Add frp Binaries**:
   - Download the `frpc` binary for your operating system from [frp releases](https://github.com/fatedier/frp/releases):
     - Linux: `frpc_linux_amd64` → rename to `frpc-linux`.
     - macOS: `frpc_darwin_amd64` → rename to `frpc-mac`.
     - Windows: `frpc_windows_amd64.exe` → rename to `frpc-windows.exe`.
   - Place these binaries in the `tunely-cli/` directory (if developing locally) or ensure they’re in the same directory as the CLI after installation.
   - For Linux/macOS, make them executable:
     ```bash
     chmod +x frpc-linux frpc-mac
     ```

## Usage
Use the CLI to save your token and create tunnels:

1. **Save Your Token**:
   - Get your JWT token from the Tunely dashboard at `https://app.tunely.snapstay.in/dashboard`.
   - Save it locally:
     ```bash
     tunely authtoken <your-token>
     ```
   - This stores the token in `~/.tunely/config.json`.

2. **Expose a Local Server**:
   - Start a local server (e.g., a React app with `npm start` on port 3000).
   - Run:
     ```bash
     tunely http 3000
     ```
   - Output example: `Exposing http://localhost:3000 at https://abc123.tunely.snapstay.in`.
   - Access your local server at the provided URL.

3. **View Help**:
   - If you’re unsure about commands:
     ```bash
     tunely --help
     ```

## Development
To work on the CLI locally:

1. **Clone the Repository** (or navigate to `tunely-cli/` if part of a monorepo):
   ```bash
   git clone <repository-url>
   cd tunely-cli
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Link Locally**:
   - Link the CLI to your system for testing:
     ```bash
     npm link
     ```

4. **Test Commands**:
   - Save a test token:
     ```bash
     tunely authtoken test-token-123
     ```
   - Expose a local server (ensure the backend and frp server are running):
     ```bash
     tunely http 3000
     ```

5. **Publish to npm** (after testing):
   - Update `package.json` with your details (author, version, etc.).
   - Publish:
     ```bash
     npm login
     npm publish --access public
     ```

## File Structure
Here’s the project structure:
```
tunely-cli/
├── bin/                # CLI entry point
│   └── tunely.js       # Main CLI script
├── lib/               # Logic modules
│   ├── config.js      # Token storage and retrieval
│   ├── tunnel.js      # Tunnel creation with frp
│   └── utils.js       # Utility functions (e.g., frpc path detection)
├── frpc-linux         # frp binary for Linux (optional inclusion)
├── frpc-mac           # frp binary for macOS (optional inclusion)
├── frpc-windows.exe   # frp binary for Windows (optional inclusion)
├── index.js           # Main module export
├── package.json       # npm configuration
└── README.md          # This file
```

## Technologies Used
- **Node.js**: Runtime for the CLI.
- **Commander.js**: Framework for building command-line interfaces.
- **axios**: Makes API requests to the backend.
- **ini**: Generates frp configuration files.
- **child_process**: Spawns the frpc process for tunneling.
- **fs-extra**: Enhanced file system utilities.
- **frp**: Fast Reverse Proxy client for tunneling.

## Configuration
- **Token Storage**: Saved in `~/.tunely/config.json`.
- **frp Token**: Replace `'your_global_frp_token'` in `lib/tunnel.js` with the token set in your frp server (`frps.ini` on the EC2 instance).

## Troubleshooting
- **"No token found"**: Run `tunely authtoken <token>` first.
- **"frpc binary not found"**: Ensure the correct frpc binary is in the CLI directory and executable.
- **Tunnel Fails**: Check that the backend (`https://api.tunely.snapstay.in`) and frp server (port 7000 on EC2) are running.
- **Permission Issues**: On Linux/macOS, ensure frpc has execute permissions (`chmod +x`).

## Contributing
Submit pull requests or issues to improve the CLI. Test locally with `npm link` before submitting changes.

## License
MIT License - free to use and modify as needed.
```

---

### Notes
- This README is beginner-friendly, with clear steps and commands ready to copy-paste.
- It assumes the CLI integrates with the Tunely backend (`https://api.tunely.snapstay.in`) and an frp server on the same EC2 instance.
- The `frpc` binaries are optional inclusions; users can download them manually if not bundled.
- Replace `<repository-url>` with your actual repository URL if applicable.
