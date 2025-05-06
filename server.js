const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Ավելացնում ենք OS մոդուլը home դիրեկտորիայի համար

const PORT = 3000;
const USERNAME = 'hrach';
const PASSWORD = '2003';

// Ստանում ենք օգտագործողի home դիրեկտորիան
const HOME_DIR = os.homedir();

function checkAuth(req, res) {
  const auth = req.headers['authorization'];
  if (!auth) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Protected Area"' });
    res.end('Authentication required');
    return false;
  }

  const b64auth = auth.split(' ')[1];
  const [user, pass] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (user === USERNAME && pass === PASSWORD) {
    return true;
  }

  res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Protected Area"' });
  res.end('Authentication failed');
  return false;
}

const server = http.createServer((req, res) => {
  if (!checkAuth(req, res)) return;

  const requestedPath = decodeURIComponent(req.url.split('?')[0]);
  const safePath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '');
  
  // Սահմանափակում ենք մուտքը միայն HOME_DIR-ի ներսում
  const fullPath = path.join(HOME_DIR, safePath);

  // Ստուգում ենք, որ fullPath-ը դեռ HOME_DIR-ի ներսում է (համաձայն path traversal-ի)
  if (!fullPath.startsWith(HOME_DIR)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(fullPath, (err, stats) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }

    if (stats.isDirectory()) {
      fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
        if (err) {
          res.writeHead(500);
          return res.end('Error reading directory');
        }

        const rows = files.map(file => {
          const name = file.name;
          const href = path.join(requestedPath, name).replace(/\\/g, '/');
          const icon = file.isDirectory() ? '📂' : '📄';
          const downloadBtn = file.isFile()
            ? `<a href="${href}" download><button>⬇️ Download</button></a>`
            : '';
          return `<tr><td>${icon}</td><td><a href="${href}">${name}</a></td><td>${downloadBtn}</td></tr>`;
        }).join('\n');

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>File Browser</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; background: #f5f5f5; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    th, td { padding: 0.5rem 1rem; border-bottom: 1px solid #ddd; text-align: left; }
    th { background: #eee; }
    a { text-decoration: none; color: #007bff; }
    button { background: #4caf50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
  </style>
</head>
<body>
  <h2>📁՝ <code>${requestedPath}</code></h2>
  <table>
    <tr><th></th><th>Name</th><th>Properties</th></tr>
    ${rows}
  </table>
</body>
</html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      });
    } else {
      const stream = fs.createReadStream(fullPath);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${path.basename(fullPath)}"`
      });
      stream.pipe(res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 File server running at http://localhost:${PORT}/`);
  console.log(`📂 Accessible files are limited to: ${HOME_DIR}`);
});
