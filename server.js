// server.js - Backend Application

const http = require('http');
const fs = require('fs');

const htmlFile = '/usr/share/nginx/html/index.html';

// Create server
const server = http.createServer((req, res) => {
    try {
        const html = fs.readFileSync(htmlFile, 'utf8');
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error loading HTML file");
    }
});

// Listen on port 3000
server.listen(3000, () => {
    console.log("Backend server running on http://localhost:3000");
});
