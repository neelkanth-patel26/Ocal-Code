import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';

export interface LiveServerFile {
  name: string;
  content: string;
  language?: string;
}

export class LiveServerManager {
  private server: http.Server | null = null;
  private currentPort = 5500;
  private files: Map<string, string> = new Map();
  private workspaceDir: string | null = null;
  private sseClients: Set<http.ServerResponse> = new Set();
  private isRunning = false;

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.html':
      case '.htm':
        return 'text/html; charset=utf-8';
      case '.css':
        return 'text/css; charset=utf-8';
      case '.js':
      case '.mjs':
        return 'application/javascript; charset=utf-8';
      case '.json':
        return 'application/json; charset=utf-8';
      case '.svg':
        return 'image/svg+xml';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.ico':
        return 'image/x-icon';
      case '.woff':
        return 'font/woff';
      case '.woff2':
        return 'font/woff2';
      case '.ttf':
        return 'font/ttf';
      default:
        return 'text/plain; charset=utf-8';
    }
  }

  public setWorkspaceDir(dir: string | null) {
    this.workspaceDir = dir && fs.existsSync(dir) ? dir : null;
    this.notifyClients();
  }

  public updateFiles(fileList: LiveServerFile[], workspaceDir?: string | null) {
    if (workspaceDir !== undefined) {
      this.workspaceDir = workspaceDir && fs.existsSync(workspaceDir) ? workspaceDir : null;
    }
    this.files.clear();
    for (const f of fileList) {
      const cleanName = f.name.replace(/^\/+/, '');
      this.files.set(cleanName.toLowerCase(), f.content);
      this.files.set(cleanName, f.content);
    }
    this.notifyClients();
  }

  private notifyClients() {
    for (const client of this.sseClients) {
      try {
        client.write('data: reload\n\n');
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  public start(requestedPort: number = 5500): Promise<{ port: number; url: string }> {
    return new Promise((resolve, reject) => {
      if (this.isRunning && this.server) {
        resolve({ port: this.currentPort, url: `http://localhost:${this.currentPort}` });
        return;
      }

      this.currentPort = requestedPort;
      const server = http.createServer(async (req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const urlPath = decodeURIComponent(req.url?.split('?')[0] || '/');

        // SSE Live-Reload Endpoint
        if (urlPath === '/__live_reload') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });
          res.write('data: connected\n\n');
          this.sseClients.add(res);

          req.on('close', () => {
            this.sseClients.delete(res);
          });
          return;
        }

        // Determine requested file target
        let targetRelative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
        
        let foundBuffer: Buffer | string | null = null;
        let resolvedFileName = targetRelative;

        // 1. Check workspace folder on disk if workspaceDir is set
        if (this.workspaceDir) {
          const directDiskPath = path.join(this.workspaceDir, targetRelative);
          if (fs.existsSync(directDiskPath) && fs.statSync(directDiskPath).isFile()) {
            try {
              foundBuffer = await fs.promises.readFile(directDiskPath);
              resolvedFileName = directDiskPath;
            } catch {}
          } else if (urlPath === '/' || !path.extname(targetRelative)) {
            // Check for index.html or fallback html in workspace root
            const indexDiskPath = path.join(this.workspaceDir, 'index.html');
            if (fs.existsSync(indexDiskPath) && fs.statSync(indexDiskPath).isFile()) {
              try {
                foundBuffer = await fs.promises.readFile(indexDiskPath);
                resolvedFileName = indexDiskPath;
              } catch {}
            }
          }
        }

        // 2. Check in-memory open editor files
        if (foundBuffer === null) {
          let memContent = this.files.get(targetRelative) || this.files.get(targetRelative.toLowerCase());

          if (!memContent && !path.extname(targetRelative)) {
            const htmlName = `${targetRelative}.html`;
            memContent = this.files.get(htmlName) || this.files.get(htmlName.toLowerCase());
            if (memContent) resolvedFileName = htmlName;
          }

          // If requesting root '/' and index.html not found, serve ANY active HTML file user is editing!
          if (!memContent && (urlPath === '/' || targetRelative === 'index.html')) {
            for (const [key, val] of this.files.entries()) {
              if (key.endsWith('.html') || key.endsWith('.htm')) {
                memContent = val;
                resolvedFileName = key;
                break;
              }
            }
          }

          if (memContent !== undefined) {
            foundBuffer = memContent;
          }
        }

        // 3. Serve found content with live reload script injection
        if (foundBuffer !== null) {
          const mime = this.getMimeType(resolvedFileName);
          res.writeHead(200, {
            'Content-Type': mime,
            'Cache-Control': 'no-cache',
          });

          if (mime.startsWith('text/html')) {
            let htmlStr = typeof foundBuffer === 'string' ? foundBuffer : foundBuffer.toString('utf8');
            const reloadScript = `
              <!-- Ocal Code Live Server Auto-Reload -->
              <script>
                (function() {
                  const es = new EventSource('/__live_reload');
                  es.onmessage = function(e) {
                    if (e.data === 'reload') {
                      location.reload();
                    }
                  };
                })();
              </script>
            `;
            if (htmlStr.includes('</body>')) {
              htmlStr = htmlStr.replace('</body>', `${reloadScript}</body>`);
            } else {
              htmlStr = `${htmlStr}${reloadScript}`;
            }
            res.end(htmlStr);
          } else {
            res.end(foundBuffer);
          }
        } else {
          // Default Welcome Landing Page only when zero user files/HTML exist
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Ocal Code Live Server</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0c0c; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: #121318; border: 1px solid #252536; border-radius: 12px; padding: 32px; text-align: center; max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { color: #34d058; font-size: 22px; margin-bottom: 8px; font-weight: 700; }
                p { color: #858585; font-size: 14px; line-height: 1.5; }
                code { background: #181920; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
                .badge { display: inline-block; background: #34d058; color: #000; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: bold; margin-top: 16px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ Ocal Code Live Server Ready</h1>
                <p>Create or open any <code>.html</code> file (e.g. <code>index.html</code>) or open a project folder in Ocal Code to render your website live with instantaneous hot reload.</p>
                <div class="badge">Hot Reload Active</div>
              </div>
              <script>
                const es = new EventSource('/__live_reload');
                es.onmessage = (e) => { if (e.data === 'reload') location.reload(); };
              </script>
            </body>
            </html>
          `);
        }
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${this.currentPort} in use, trying port ${this.currentPort + 1}`);
          this.currentPort += 1;
          server.listen(this.currentPort);
        } else {
          this.isRunning = false;
          reject(err);
        }
      });

      server.listen(this.currentPort, () => {
        this.server = server;
        this.isRunning = true;
        console.log(`✔ [Ocal Code Live Server] Online and listening on http://localhost:${this.currentPort}`);
        resolve({ port: this.currentPort, url: `http://localhost:${this.currentPort}` });
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        for (const client of this.sseClients) {
          try { client.end(); } catch {}
        }
        this.sseClients.clear();
        this.server.close(() => {
          this.server = null;
          this.isRunning = false;
          resolve();
        });
      } else {
        this.isRunning = false;
        resolve();
      }
    });
  }

  public getStatus() {
    return {
      running: this.isRunning,
      port: this.currentPort,
      url: `http://localhost:${this.currentPort}`,
    };
  }
}

export const liveServerManager = new LiveServerManager();
