
Tunely is a tunneling service similar to ngrok, designed to expose local servers to the internet securely and easily. It consists of three main components: a React-based frontend, a Node.js backend with MongoDB, and a CLI tool. The project leverages AWS (S3, EC2, CloudFront, Route 53) and frp (Fast Reverse Proxy) for deployment and tunneling.

## Project Overview
Tunely allows users to:
- Register and log in via a web interface to obtain an authentication token.
- Use the token with a CLI to create tunnels for local servers.
- Access their local servers via unique subdomains (e.g., `https://abc123.tunely.snapstay.in`).

### Components
1. **Frontend**: User interface for registration, login, and token management.
   - Deployed at: `https://app.tunely.snapstay.in`
2. **Backend**: API for authentication and tunnel subdomain generation.
   - Deployed at: `https://api.tunely.snapstay.in`
3. **CLI**: Command-line tool to save tokens and create tunnels.
   - npm package: `tunely`

## Features
- Modern, responsive frontend with AntD, Tailwind CSS, and Bootstrap 5.
- Secure backend with JWT authentication, password hashing, and MongoDB storage.
- Easy-to-use CLI for tunneling local servers with frp.
- HTTPS support across all domains using Let’s Encrypt.

## Prerequisites
- **Node.js** and **npm** installed (download from [nodejs.org](https://nodejs.org/)).
- **MongoDB** installed locally or a MongoDB Atlas account.
- An **AWS account** with access to S3, EC2, CloudFront, Route 53, and ACM.
- A domain (e.g., `snapstay.in`) configured in Route 53.
- **frp** binaries from [frp releases](https://github.com/fatedier/frp/releases)).

## Setup Instructions
Follow these steps to set up each component locally:

### 1. Frontend Setup
1. **Navigate to Frontend Directory**:
   ```bash
   cd tunely-frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Locally**:
   ```bash
   npm start
   ```
   - Opens at `http://localhost:3000`.

### 2. Backend Setup
1. **Navigate to Backend Directory**:
   ```bash
   cd tunely-backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Up Environment Variables**:
   - Create a `.env` file:
     ```plaintext
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/tunely
     JWT_SECRET=your_jwt_secret_key_here
     ```
   - Replace `MONGO_URI` and `JWT_SECRET` with your values.
4. **Run MongoDB** (if local):
   ```bash
   mongod
   ```
5. **Run the Server**:
   ```bash
   npm start
   ```
   - Runs at `http://localhost:3000`.

### 3. CLI Setup
1. **Navigate to CLI Directory**:
   ```bash
   cd tunely-cli
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Add frp Binaries**:
   - Download `frpc` for your OS (Linux: `frpc-linux`, macOS: `frpc-mac`, Windows: `frpc-windows.exe`).
   - Place them in `tunely-cli/`.
   - For Linux/macOS:
     ```bash
     chmod +x frpc-linux frpc-mac
     ```
4. **Link Locally**:
   ```bash
   npm link
   ```

## Deployment
Deploy each component to AWS for production use.

### Frontend Deployment (AWS S3 + CloudFront)
1. **Build the Frontend**:
   ```bash
   cd tunely-frontend
   npm run build
   ```
2. **Upload to S3**:
   - Create an S3 bucket (`tunely-frontend`):
     ```bash
     aws s3 sync build/ s3://tunely-frontend --acl public-read
     ```
3. **Set Up CloudFront**:
   - Create a distribution with origin `tunely-frontend.s3.amazonaws.com`.
   - Add CNAME `app.tunely.snapstay.in`.
   - Use an ACM certificate for HTTPS.
   - Note the CloudFront domain (e.g., `d123456789.cloudfront.net`).
4. **Update Route 53**:
   - A record: `app.tunely.snapstay.in` → CloudFront domain.
   - URL: `https://app.tunely.snapstay.in`.

### Backend Deployment (AWS EC2)
1. **Launch EC2 Instance**:
   - Use Ubuntu (t2.micro).
   - Open ports: 3000, 80, 443, 7000.
2. **Upload Backend**:
   ```bash
   scp -r tunely-backend/ ubuntu@<ec2-public-ip>:/home/ubuntu/tunely-backend
   ```
3. **Set Up EC2**:
   ```bash
   ssh ubuntu@<ec2-public-ip>
   sudo apt update
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pm2
   cd tunely-backend
   npm install
   pm2 start index.js
   ```
4. **Set Up frp Server**:
   ```bash
   wget https://github.com/fatedier/frp/releases/download/v0.58.1/frp_0.58.1_linux_amd64.tar.gz
   tar -xzf frp_0.58.1_linux_amd64.tar.gz
   sudo mv frp_0.58.1_linux_amd64/frps /usr/local/bin/
   ```
   - Create `frps.ini`:
     ```ini
     [common]
     bind_port = 7000
     vhost_http_port = 8080
     subdomain_host = tunely.snapstay.in
     token = your_global_frp_token
     ```
   - Run: `pm2 start frps -- -c frps.ini`.
5. **Set Up Nginx**:
   ```bash
   sudo apt install -y nginx
   ```
   - Create `/etc/nginx/sites-available/api`:
     ```nginx
     server {
         listen 80;
         server_name api.tunely.snapstay.in;
         location / {
             proxy_pass http://localhost:3000;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
         }
     }
     ```
   - Create `/etc/nginx/sites-available/tunnel`:
     ```nginx
     server {
         listen 80;
         server_name ~^(?<subdomain>.+)\.tunely\.snapstay\.in$;
         location / {
             proxy_pass http://localhost:8080;
             proxy_set_header Host $subdomain.tunely.snapstay.in;
             proxy_set_header X-Real-IP $remote_addr;
         }
     }
     ```
   - Enable and restart:
     ```bash
     sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
     sudo ln -s /etc/nginx/sites-available/tunnel /etc/nginx/sites-enabled/
     sudo systemctl restart nginx
     ```
6. **Add HTTPS**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.tunely.snapstay.in
   sudo certbot certonly --manual --preferred-challenges=dns -d "*.tunely.snapstay.in"
   ```
   - Follow DNS validation steps for the wildcard certificate.
7. **Update Route 53**:
   - A record: `api.tunely.snapstay.in` → `<ec2-public-ip>`.
   - A record: `*.tunely.snapstay.in` → `<ec2-public-ip>`.

### CLI Deployment (npm)
1. **Build and Publish**:
   ```bash
   cd tunely-cli
   npm install
   npm publish --access public
   ```
2. **Install Globally**:
   ```bash
   npm install -g tunely
   ```

## Usage
1. **Frontend**:
   - Visit `https://app.tunely.snapstay.in`.
   - Register or log in to get a token.
   - View the token on `/dashboard`.

2. **Backend**:
   - Test APIs with curl/Postman:
     - Register: `POST https://api.tunely.snapstay.in/api/register` with `{ "email": "test@example.com", "password": "password123" }`.
     - Login: `POST https://api.tunely.snapstay.in/api/login` with same payload.
     - Tunnel: `POST https://api.tunely.snapstay.in/api/tunnel` with `Authorization: Bearer <token>`.

3. **CLI**:
   - Save token:
     ```bash
     tunely authtoken <your-token>
     ```
   - Expose server:
     ```bash
     tunely http 3000
     ```
   - Access at `https://abc123.tunely.snapstay.in`.

## File Structures

### Frontend (`tunely-frontend/`)
```
tunely-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── AuthForm.js
│   │   └── Dashboard.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── styles/
│   │   └── GlobalStyles.js
│   ├── App.js
│   └── index.js
├── package.json
├── tailwind.config.js
```

### Backend (`tunely-backend/`)
```
tunely-backend/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   └── Tunnel.js
├── routes/
│   ├── auth.js
│   └── tunnel.js
├── .env
├── index.js
├── package.json
```

### CLI (`tunely-cli/`)
```
tunely-cli/
├── bin/
│   └── tunely.js
├── lib/
│   ├── config.js
│   ├── tunnel.js
│   └── utils.js
├── frpc-linux
├── frpc-mac
├── frpc-windows.exe
├── index.js
├── package.json
```

## Technologies Used
- **Frontend**: React, Ant Design, Tailwind CSS, Bootstrap 5, AWS S3, CloudFront.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, bcryptjs, jsonwebtoken, AWS EC2, Nginx.
- **CLI**: Node.js, Commander.js, axios, ini, child_process, fs-extra, frp.

## Troubleshooting
- **Frontend**: Ensure backend API (`https://api.tunely.snapstay.in`) is running for login/register.
- **Backend**: Check MongoDB connection and Nginx logs (`/var/log/nginx/error.log`).
- **CLI**: Verify frpc binaries are present and executable; ensure token is saved.

## Contributing
Submit pull requests or issues to improve any component. Test locally before deploying changes.

## License
MIT License - free to use and modify as needed.
```

---

### Notes
- This combined README assumes a project directory structure with `tunely-frontend/`, `tunely-backend/`, and `tunely-cli/` as subdirectories.
- It’s beginner-friendly with detailed steps, commands, and explanations.
- Replace `<repository-url>` and `<ec2-public-ip>` with your actual values.
- The frp token (`your_global_frp_token`) should match across the backend (`frps.ini`) and CLI (`tunnel.js`).
