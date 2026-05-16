import handler from './api/motivasi.js';
import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // Set CORS headers - Allow GitHub Pages domain
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://firmanahmad-max.github.io',
    'https://goodday-app-v3.railway.app',
    'http://localhost:3000',
    'http://localhost:5500'
  ];
  
  if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '3600');

  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route: /api/motivasi
  if (req.url === '/api/motivasi' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        // Mock req object dengan data dari body
        const mockReq = {
          method: 'POST',
          body: data
        };

        // Vercel-compatible response shim. The handler in api/motivasi.js
        // uses res.status(X).json({...}) and expects the response to be sent
        // immediately — without this, the connection hangs until the client
        // gives up (the source of the 120s frontend timeouts).
        let statusCode = 200;
        let sent = false;
        const resProxy = {
          status: (code) => {
            statusCode = code;
            return resProxy;
          },
          json: (data) => {
            if (sent) return resProxy;
            sent = true;
            if (!res.headersSent) {
              res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            }
            res.end(JSON.stringify(data));
            return resProxy;
          },
          setHeader: (key, value) => {
            if (!res.headersSent) res.setHeader(key, value);
            return resProxy;
          },
          end: () => {
            if (sent) return;
            sent = true;
            if (!res.headersSent) res.writeHead(statusCode);
            res.end();
          }
        };

        // Call handler
        await handler(mockReq, resProxy);

        // Safety net: if the handler returned without sending a response,
        // close the connection cleanly rather than letting it hang.
        if (!sent) {
          console.error('[GoodDay Server] Handler returned without sending response');
          if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Handler did not send response' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error: ' + err.message }));
      }
    });
    return;
  }

  // Health check endpoint
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'GoodDay API running', version: '3.0' }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[GoodDay Server] Running on port ${PORT}`);
  console.log(`[GoodDay Server] API endpoint: http://localhost:${PORT}/api/motivasi`);
});
