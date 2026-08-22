import * as http from 'http';
import * as path from 'path';

export interface LiveServerFile {
  name: string;
  content: string;
  language?: string;
}

export class LiveServerManager {
  private server: http.Server | null = null;
  private currentPort = 5500;
  private files: Map<string, string> = new Map();
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
      default:
        return 'text/plain; charset=utf-8';
    }
  }

  public updateFiles(fileList: LiveServerFile[]) {
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
      const server = http.createServer((req, res) => {
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

        // Determine requested file
        let targetName = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
        let content = this.files.get(targetName) || this.files.get(targetName.toLowerCase());

        // If not found and target doesn't have extension, check for .html
        if (!content && !path.extname(targetName)) {
          targetName = `${targetName}.html`;
          content = this.files.get(targetName) || this.files.get(targetName.toLowerCase());
        }

        // If still not found, fallback to index.html or first HTML file in workspace
        if (!content) {
          for (const [key, val] of this.files.entries()) {
            if (key.endsWith('.html')) {
              content = val;
              targetName = key;
              break;
            }
          }
        }

        if (content !== undefined) {
          const mime = this.getMimeType(targetName);
          res.writeHead(200, {
            'Content-Type': mime,
            'Cache-Control': 'no-cache',
          });

          // Inject Live Reload snippet into HTML
          if (mime.startsWith('text/html')) {
            const reloadScript = `
              <!-- Ocal++ Live Server Auto-Reload -->
              <script>
                (function() {
                  const es = new EventSource('/__live_reload');
                  es.onmessage = function(e) {
                    if (e.data === 'reload') {
                      console.log('[Ocal++ Live Server] Reloading page...');
                      location.reload();
                    }
                  };
                  es.onerror = function() {
                    console.warn('[Ocal++ Live Server] Disconnected. Reconnecting...');
                  };
                })();
              </script>
            `;
            if (content.includes('</body>')) {
              content = content.replace('</body>', `${reloadScript}</body>`);
            } else {
              content = `${content}${reloadScript}`;
            }
          }

          res.end(content);
        } else {
          // Default Welcome Landing Page when no files are loaded
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Ocal Code Live Server</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; text-align: center; max-width: 450px; }
                h1 { color: #38bdf8; font-size: 22px; margin-bottom: 8px; }
                p { color: #94a3b8; font-size: 14px; }
                .badge { display: inline-block; background: #0284c7; color: white; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: bold; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>⚡ Ocal Code Live Server Online</h1>
                <p>Server running on <strong>http://localhost:${this.currentPort}</strong>. Add or edit an <code>index.html</code> file in Ocal Code to render your website live.</p>
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
          // Try next port if 5500 is occupied
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
        console.log(`✔ [Ocal++ Live Server] Online and listening on http://localhost:${this.currentPort}`);
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
