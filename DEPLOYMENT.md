# Chatify Deployment Guide

This guide covers various deployment options for the Chatify real-time chat application, including Docker, cloud platforms, and traditional server deployments.

## 🐳 Docker Deployment

### Prerequisites
- Docker installed on your system
- Docker Compose (optional, for multi-container setup)

### Single Container Deployment

#### 1. Build Docker Image
```bash
# From the project root directory
docker build -t chatify-app .
```

#### 2. Run Container
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=your_mongodb_connection_string \
  -e JWT_SECRET=your_jwt_secret \
  -e CLOUDINARY_CLOUD_NAME=your_cloud_name \
  -e CLOUDINARY_API_KEY=your_api_key \
  -e CLOUDINARY_API_SECRET=your_api_secret \
  -e RESEND_API_KEY=your_resend_api_key \
  -e EMAIL_FROM=your_email@domain.com \
  -e EMAIL_FROM_NAME=Chatify \
  -e ARCJET_KEY=your_arcjet_key \
  -e NODE_ENV=production \
  -e CLIENT_URL=https://your-domain.com \
  chatify-app
```

#### 3. Using Docker Compose
Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  chatify:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/chatify
      - JWT_SECRET=your_jwt_secret
      - CLOUDINARY_CLOUD_NAME=your_cloud_name
      - CLOUDINARY_API_KEY=your_api_key
      - CLOUDINARY_API_SECRET=your_api_secret
      - RESEND_API_KEY=your_resend_api_key
      - EMAIL_FROM=your_email@domain.com
      - EMAIL_FROM_NAME=Chatify
      - ARCJET_KEY=your_arcjet_key
      - NODE_ENV=production
      - CLIENT_URL=https://your-domain.com
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

Run with Docker Compose:
```bash
docker-compose up -d
```

### Multi-Stage Docker Build (Optimized)

Create an optimized `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production
WORKDIR /app/backend
RUN npm ci --only=production
WORKDIR /app/frontend
RUN npm ci

# Copy source code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production
WORKDIR /app/backend
RUN npm ci --only=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

## ☁️ Cloud Platform Deployments

### 1. Vercel Deployment

#### Frontend Only (Recommended)
1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "cd frontend && npm run build",
     "outputDirectory": "frontend/dist",
     "installCommand": "npm install"
   }
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch

#### Full-Stack Deployment
1. **Create `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/src/index.js",
         "use": "@vercel/node"
       },
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/backend/src/index.js"
       },
       {
         "src": "/(.*)",
         "dest": "/frontend/$1"
       }
     ]
   }
   ```

### 2. Railway Deployment

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure Railway**
   - Select your repository
   - Railway will auto-detect the Node.js project

3. **Environment Variables**
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   CLIENT_URL=https://your-app.railway.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=your_email@domain.com
   EMAIL_FROM_NAME=Chatify
   ARCJET_KEY=your_arcjet_key
   ```

4. **Deploy**
   - Railway will automatically build and deploy

### 3. Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
   heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
   heroku config:set CLOUDINARY_API_KEY=your_api_key
   heroku config:set CLOUDINARY_API_SECRET=your_api_secret
   heroku config:set RESEND_API_KEY=your_resend_api_key
   heroku config:set EMAIL_FROM=your_email@domain.com
   heroku config:set EMAIL_FROM_NAME=Chatify
   heroku config:set ARCJET_KEY=your_arcjet_key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### 4. DigitalOcean App Platform

1. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"

2. **Connect Repository**
   - Select your GitHub repository
   - Choose the main branch

3. **Configure App Spec**
   ```yaml
   name: chatify
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/chatify
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: MONGODB_URI
       value: your_mongodb_uri
     - key: JWT_SECRET
       value: your_jwt_secret
     - key: NODE_ENV
       value: production
     - key: CLIENT_URL
       value: https://your-app.ondigitalocean.app
     - key: CLOUDINARY_CLOUD_NAME
       value: your_cloud_name
     - key: CLOUDINARY_API_KEY
       value: your_api_key
     - key: CLOUDINARY_API_SECRET
       value: your_api_secret
     - key: RESEND_API_KEY
       value: your_resend_api_key
     - key: EMAIL_FROM
       value: your_email@domain.com
     - key: EMAIL_FROM_NAME
       value: Chatify
     - key: ARCJET_KEY
       value: your_arcjet_key
   ```

4. **Deploy**
   - Click "Create Resources"
   - DigitalOcean will build and deploy your app

## 🖥️ Traditional Server Deployment

### 1. VPS Deployment (Ubuntu/CentOS)

#### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

#### Installation Steps

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/WhySeriousKaif/Chatify.git
   cd Chatify
   ```

5. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

6. **Build Frontend**
   ```bash
   cd frontend && npm run build
   cd ..
   ```

7. **Create PM2 Ecosystem File**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'chatify',
       script: 'backend/src/index.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         MONGODB_URI: 'your_mongodb_uri',
         JWT_SECRET: 'your_jwt_secret',
         CLIENT_URL: 'https://your-domain.com',
         CLOUDINARY_CLOUD_NAME: 'your_cloud_name',
         CLOUDINARY_API_KEY: 'your_api_key',
         CLOUDINARY_API_SECRET: 'your_api_secret',
         RESEND_API_KEY: 'your_resend_api_key',
         EMAIL_FROM: 'your_email@domain.com',
         EMAIL_FROM_NAME: 'Chatify',
         ARCJET_KEY: 'your_arcjet_key'
       }
     }]
   }
   ```

8. **Start Application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

9. **Install and Configure Nginx**
   ```bash
   sudo apt install nginx -y
   ```

10. **Create Nginx Configuration**
    ```nginx
    # /etc/nginx/sites-available/chatify
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

11. **Enable Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/chatify /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. **Install SSL Certificate**
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d your-domain.com
    ```

### 2. AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Select t2.micro (free tier)
   - Configure security group (ports 22, 80, 443, 3000)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Follow VPS Deployment Steps**
   - Same as VPS deployment above

4. **Configure Security Group**
   - Allow HTTP (80) and HTTPS (443)
   - Allow custom TCP (3000) for testing

### 3. Google Cloud Platform

1. **Create VM Instance**
   - Choose Ubuntu 20.04 LTS
   - Select e2-micro (free tier)
   - Allow HTTP and HTTPS traffic

2. **Connect to Instance**
   ```bash
   gcloud compute ssh your-instance-name --zone=your-zone
   ```

3. **Follow VPS Deployment Steps**
   - Same as VPS deployment above

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatify

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Client URL
CLIENT_URL=https://your-domain.com

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Chatify

# Security (Arcjet)
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=production
```

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ARCJET_ENV=development
```

#### Staging
```env
NODE_ENV=staging
CLIENT_URL=https://staging.yourdomain.com
ARCJET_ENV=staging
```

#### Production
```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
ARCJET_ENV=production
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use environment-specific configurations

### 2. HTTPS Configuration
- Always use HTTPS in production
- Configure proper SSL certificates
- Use HSTS headers
- Redirect HTTP to HTTPS

### 3. Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable authentication
- Use strong passwords
- Regular backups

### 4. Application Security
- Enable rate limiting
- Use CORS properly
- Validate all inputs
- Keep dependencies updated

## 📊 Monitoring and Logging

### 1. Application Monitoring
```javascript
// Add to backend/src/index.js
const morgan = require('morgan');

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 2. PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs chatify

# Restart application
pm2 restart chatify

# Stop application
pm2 stop chatify
```

### 3. Nginx Logging
```nginx
# Add to nginx configuration
access_log /var/log/nginx/chatify_access.log;
error_log /var/log/nginx/chatify_error.log;
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm install
        cd backend && npm install
        cd ../frontend && npm install
    
    - name: Build frontend
      run: |
        cd frontend && npm run build
    
    - name: Deploy to Railway
      uses: railway-app/railway-deploy@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
        service: ${{ secrets.RAILWAY_SERVICE }}
```

## 🔄 Backup and Recovery

### 1. Database Backup
```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=backup/

# Restore from backup
mongorestore --uri="your_mongodb_uri" backup/
```

### 2. Application Backup
```bash
# Backup application files
tar -czf chatify-backup-$(date +%Y%m%d).tar.gz /path/to/chatify

# Backup with PM2
pm2 save
```

### 3. Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your_mongodb_uri" --out=backup/$DATE
tar -czf backup/chatify-$DATE.tar.gz /path/to/chatify
find backup/ -name "*.tar.gz" -mtime +7 -delete
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 PID
   ```

2. **Permission Denied**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/chatify
   chmod +x scripts/*
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   free -h
   
   # Restart PM2 if needed
   pm2 restart chatify
   ```

4. **Database Connection Issues**
   - Check MongoDB URI
   - Verify network connectivity
   - Check firewall settings

### Log Analysis
```bash
# View application logs
pm2 logs chatify --lines 100

# View nginx logs
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u nginx -f
```

## 📈 Performance Optimization

### 1. Application Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries

### 2. Server Optimization
- Use SSD storage
- Increase RAM if needed
- Configure swap space
- Monitor resource usage

### 3. Database Optimization
- Create proper indexes
- Use connection pooling
- Monitor query performance
- Regular maintenance

---

**Deployment Complete! 🚀**

Your Chatify application is now ready for production use. Choose the deployment method that best fits your needs and follow the corresponding guide.
