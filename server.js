import { createRequestHandler } from "@remix-run/express";
import express from "express";

const app = express();
const port = process.env.PORT || 5173;

// Trust Railway's proxy
app.set('trust proxy', true);

// Handle Railway's host headers
app.use((req, res, next) => {
  // Allow Railway hosts
  const allowedHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    /.*\.railway\.app$/,
    /.*\.up\.railway\.app$/
  ];
  
  const host = req.get('host');
  const isAllowed = allowedHosts.some(allowed => {
    if (typeof allowed === 'string') {
      return host === allowed;
    }
    return allowed.test(host);
  });
  
  if (!isAllowed) {
    console.log(`Blocked host: ${host}`);
    return res.status(403).send('Host not allowed');
  }
  
  next();
});

// Load Remix build
const build = await import("./build/index.js");

// Remix request handler
app.all("*", createRequestHandler({ build }));

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
