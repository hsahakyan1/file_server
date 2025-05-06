# file_server
# file_server



---

# Node.js Authenticated File Browser with Cloudflared Tunnel

This is a simple, self-contained Node.js HTTP server that lets you browse and download files from your home directory through the browser. It supports basic authentication and can be exposed to the internet securely using Cloudflare Tunnels (`cloudflared`).

---

## Features

- Basic HTTP authentication (`admin:admin` by default)
- Directory listing with folder/file icons
- File download support
- Protection against path traversal attacks
- Serves only from the current user's home directory
- Can be published to the internet using Cloudflare Tunnel

---

## Requirements

- **Node.js** (v12 or higher)
- **cloudflared** (Cloudflare CLI tool)

---

## Installation

1. Create a new file called `server.js` and paste the code into it.
2. Install `cloudflared` (see instructions below).
3. Run the server and publish it online.

---

## Running the Server

### 1. Start the File Server

```bash
node server.js

By default, the server runs on http://localhost:3000.

You can configure the credentials and port at the top of server.js:

const PORT = 3000;
const USERNAME = 'admin';
const PASSWORD = 'admin';


---

2. Install cloudflared

On Linux / macOS:

curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

On Windows:

Download from:
https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/


---

3. Expose Your Server with cloudflared

Run the following command:

cloudflared tunnel --url http://localhost:3000

Cloudflared will generate a public HTTPS URL, for example:

https://fast-cloud-cat.cloudflared.app

You can now access your file browser securely from anywhere using that URL.


---

Security Notes

Only basic HTTP authentication is used—consider using HTTPS or Zero Trust for better security.

The app only serves content within your home directory.

Uploading files is not supported—read/download only.





