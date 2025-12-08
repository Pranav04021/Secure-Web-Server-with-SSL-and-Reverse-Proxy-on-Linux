# Secure-Web-Server-with-SSL-and-Reverse-Proxy-on-Linux
# Secure Web Server with Nginx, SSL & Reverse Proxy (Ubuntu)

This project demonstrates how to deploy a secure web server on Ubuntu using:
- **Nginx** as a reverse proxy  
- **Node.js** as a backend server  
- **SSL/TLS (self-signed)** for HTTPS  
- **systemd** to keep the backend running

---

## 1. Prerequisites

- Ubuntu (VM, WSL, or physical machine)
- Basic terminal access with `sudo` privileges

Install basic tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl nano ufw

## 2. Install Node.js and Nginx

sudo apt install -y nodejs npm nginx openssl

Verify:
node -v
npm -v
nginx -v

Create Backend Application (Node.js)

Create project folder:

mkdir -p ~/secure-backend
cd ~/secure-backend


Create server.js:

nano server.js


Paste:

const http = require('http');
const fs = require('fs');

const htmlFile = '/usr/share/nginx/html/index.html';

const server = http.createServer((req, res) => {
  try {
    const html = fs.readFileSync(htmlFile, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error loading HTML file');
  }
});

server.listen(3000, () => {
  console.log('Backend server running on http://localhost:3000');
});


Test locally:

node server.js
curl http://localhost:3000


(Press Ctrl + C to stop.)

4. Create HTML Page

Edit the default web root:

sudo nano /usr/share/nginx/html/index.html


Example content:

<!DOCTYPE html>
<html>
<head>
  <title>Secure Web Server - Nginx + SSL</title>
</head>
<body>
  <h1>Secure Backend App Running Behind Reverse Proxy</h1>
  <p>This server uses Nginx, SSL/TLS, and a reverse proxy.</p>
</body>
</html>

5. Create systemd Service for Backend

Create service file:

sudo nano /etc/systemd/system/secure-backend.service


Paste (replace pranav with your Ubuntu username if needed):

[Unit]
Description=Secure Backend Node.js Service
After=network.target

[Service]
ExecStart=/usr/bin/node /home/pranav/secure-backend/server.js
Restart=always
User=pranav
WorkingDirectory=/home/pranav/secure-backend
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target


Enable and start the service:

sudo systemctl daemon-reload
sudo systemctl enable secure-backend
sudo systemctl start secure-backend
sudo systemctl status secure-backend


You should see active (running).

6. Generate Self-Signed SSL Certificate

Create SSL directory:

sudo mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl


Generate certificate and key (valid for 1 year):

sudo openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout selfsigned.key -out selfsigned.crt -days 365

7. Configure Nginx as Reverse Proxy with HTTPS

Create site config:

sudo nano /etc/nginx/sites-available/secure-site


Paste:

# HTTP: redirect to HTTPS
server {
    listen 80;
    server_name _;

    return 301 https://$host$request_uri;
}

# HTTPS: reverse proxy to backend
server {
    listen 443 ssl;
    server_name _;

    ssl_certificate     /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

    # Basic security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


Enable site and disable default:

sudo ln -s /etc/nginx/sites-available/secure-site /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null


Test and reload Nginx:

sudo nginx -t
sudo systemctl reload nginx

8. Configure Firewall (Optional but Recommended)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status


This allows ports 80 and 443.

9. Testing the Setup
Backend Directly
curl http://localhost:3000

Through Nginx (HTTP)
curl http://localhost

Through Nginx (HTTPS, ignoring self-signed warning)
curl -k https://localhost

Browser

Open: http://localhost → should redirect to https://localhost

Accept browser warning (self-signed cert) → you should see your HTML page.

10. Project Structure (Example)
secure-backend/
├── server.js

/etc/nginx/
├── nginx.conf
├── sites-available/
│   └── secure-site
├── sites-enabled/
│   └── secure-site
├── ssl/
│   ├── selfsigned.crt
│   └── selfsigned.key

/usr/share/nginx/html/
└── index.html

11. How to Restart Services
# Restart backend
sudo systemctl restart secure-backend

# Restart Nginx
sudo systemctl restart nginx

12. Future Enhancements

Use Let’s Encrypt instead of self-signed certificates

Add monitoring and logging dashboards

Deploy to a cloud VM (AWS / Azure / GCP)

Add CI/CD pipeline (GitHub Actions / Jenkins)
