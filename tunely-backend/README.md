

The Tunely Backend is a Node.js and Express.js server that powers the Tunely tunneling service. It provides APIs for user authentication (register and login) and tunnel management, storing data in MongoDB. The backend is designed to be secure, scalable, and easy to deploy on AWS EC2.

## Features
- **User Authentication**: Register and login endpoints that issue JWT tokens.
- **Tunnel Management**: Generates unique subdomains for users to expose their local servers.
- **Security**: Password hashing with bcrypt, JWT authentication, and CORS support.
- **Error Handling**: Robust validation and meaningful error messages.

## Prerequisites
Before setting up the backend, ensure you have:
- **Node.js** and **npm** installed on your machine (download from [nodejs.org](https://nodejs.org/)).
- **MongoDB** installed locally or a MongoDB Atlas account for a cloud database.
- An **AWS account** with access to EC2 and Route 53.
- A domain (e.g., `snapstay.in`) configured in Route 53.

## Setup Instructions
Follow these steps to set up and run the backend locally:

1. **Clone the Repository** (or navigate to `tunely-backend/` if part of a monorepo):
   ```bash
   git clone <repository-url>
   cd tunely-backend
   ```

2. **Install Dependencies**:
   Install all required packages:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory:
     ```plaintext
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/tunely
     JWT_SECRET=your_jwt_secret_key_here
     ```
   - **PORT**: The port the server will run on (default is 3000).
   - **MONGO_URI**: Your MongoDB connection string (use `mongodb://localhost:27017/tunely` for local MongoDB or a MongoDB Atlas URI).
   - **JWT_SECRET**: A strong, unique secret key for JWT tokens (e.g., `x7k9p2m4q8v1n3`).

4. **Run MongoDB Locally** (if not using Atlas):
   - Install MongoDB on your machine (instructions vary by OS; see [MongoDB docs](https://docs.mongodb.com/manual/installation/)).
   - Start the MongoDB service:
     ```bash
     mongod
     ```

5. **Run the Server**:
   Start the backend locally:
   ```bash
   npm start
   ```
   - The server will run at `http://localhost:3000`.
   - For development with auto-restart, use:
     ```bash
     npm run dev
     ```

## Deployment to AWS EC2
Deploy the backend to an AWS EC2 instance with Nginx for reverse proxy and HTTPS.

1. **Launch an EC2 Instance**:
   - Go to the AWS EC2 console.
   - Launch an Ubuntu instance (e.g., t2.micro, free tier eligible).
   - Open security group ports: 3000 (backend), 80 (HTTP), 443 (HTTPS), 7000 (frp).
   - Note the public IP (e.g., `<ec2-public-ip>`).

2. **Upload the Backend Code**:
   - From your local machine, upload the `tunely-backend/` folder to EC2:
     ```bash
     scp -r tunely-backend/ ubuntu@<ec2-public-ip>:/home/ubuntu/tunely-backend
     ```

3. **Set Up the EC2 Instance**:
   - SSH into the instance:
     ```bash
     ssh ubuntu@<ec2-public-ip>
     ```
   - Install dependencies:
     ```bash
     sudo apt update
     sudo apt install -y mongodb
     sudo systemctl start mongodb
     curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
     sudo apt install -y nodejs
     sudo npm install -g pm2
     cd tunely-backend
     npm install
     ```
   - Start the backend with PM2 (keeps it running in the background):
     ```bash
     pm2 start index.js
     ```

4. **Set Up Nginx**:
   - Install Nginx:
     ```bash
     sudo apt install -y nginx
     ```
   - Create a configuration file at `/etc/nginx/sites-available/api`:
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
   - Enable the config and restart Nginx:
     ```bash
     sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
     sudo systemctl restart nginx
     ```

5. **Add HTTPS with Let’s Encrypt**:
   - Install Certbot:
     ```bash
     sudo apt install -y certbot python3-certbot-nginx
     ```
   - Run Certbot to secure the domain:
     ```bash
     sudo certbot --nginx -d api.tunely.snapstay.in
     ```
   - Follow the prompts to configure HTTPS.

6. **Update Route 53**:
   - Go to your Route 53 hosted zone for `snapstay.in`.
   - Create an A record:
     - **Name**: `api.tunely.snapstay.in`
     - **Value**: `<ec2-public-ip>` (your EC2 instance’s public IP).
   - Wait for DNS propagation (up to 24 hours, usually faster).

7. **Verify Deployment**:
   - The backend will be live at `https://api.tunely.snapstay.in`.

## Usage
Use tools like Postman or curl to interact with the APIs:

1. **Register a User**:
   ```bash
   curl -X POST https://api.tunely.snapstay.in/api/register \
   -H "Content-Type: application/json" \
   -d '{"email": "test@example.com", "password": "password123"}'
   ```
   - Response: `{ "token": "<jwt-token>" }`

2. **Login**:
   ```bash
   curl -X POST https://api.tunely.snapstay.in/api/login \
   -H "Content-Type: application/json" \
   -d '{"email": "test@example.com", "password": "password123"}'
   ```
   - Response: `{ "token": "<jwt-token>" }`

3. **Create a Tunnel**:
   - Use the token from login/register:
     ```bash
     curl -X POST https://api.tunely.snapstay.in/api/tunnel \
     -H "Authorization: Bearer <jwt-token>" \
     -H "Content-Type: application/json"
     ```
   - Response: `{ "subdomain": "abc123.tunely.snapstay.in" }`

## File Structure
Here’s the project structure:
```
tunely-backend/
├── config/            # Configuration files
│   └── db.js         # MongoDB connection setup
├── middleware/       # Middleware for authentication
│   └── auth.js       # JWT authentication middleware
├── models/           # MongoDB schemas
│   ├── User.js       # User model
│   └── Tunnel.js     # Tunnel model
├── routes/           # API routes
│   ├── auth.js       # Authentication routes
│   └── tunnel.js     # Tunnel management routes
├── .env              # Environment variables (not tracked in git)
├── index.js          # Main server file
├── package.json      # npm configuration
└── README.md         # This file
```

## Technologies Used
- **Node.js**: JavaScript runtime.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing users and tunnels.
- **Mongoose**: ORM for MongoDB.
- **bcryptjs**: Password hashing for security.
- **jsonwebtoken**: JWT generation and verification.
- **dotenv**: Environment variable management.
- **cors**: Cross-origin resource sharing for frontend access.
- **AWS EC2**: Hosting platform.
- **Nginx**: Reverse proxy and HTTPS server.

## Development Notes
- **Security**: Ensure `JWT_SECRET` is strong and kept secret. Use HTTPS in production.
- **MongoDB**: If using MongoDB Atlas, update `MONGO_URI` in `.env` with your Atlas connection string.
- **frp Integration**: The backend generates subdomains used by the frp server (running on the same EC2 instance).

## Troubleshooting
- **MongoDB Connection**: If the server fails to start, check `MONGO_URI` and ensure MongoDB is running.
- **API Errors**: Use logs (e.g., `console.log`) in `index.js` to debug issues.
- **Nginx Issues**: Verify the config with `sudo nginx -t` and check logs at `/var/log/nginx/error.log`.

## Contributing
Submit pull requests or issues to enhance the backend. Test locally before deploying changes.

## License
MIT License - free to use and modify as needed.
```

---

### Notes
- This README is tailored for beginners, with step-by-step instructions and ready-to-use commands.
- It assumes integration with the Tunely frontend and CLI, as well as an frp server for tunneling (mentioned briefly under deployment).
- Replace `<repository-url>` and `<ec2-public-ip>` with your actual values.
- The backend is deployed at `https://api.tunely.snapstay.in`, matching your previous setup.