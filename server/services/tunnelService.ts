import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';

let tunnelProcess: ChildProcess | null = null;
let currentPublicUrl: string | null = null;

export function getPublicTunnelUrl(): string | null {
  if (currentPublicUrl) return currentPublicUrl;
  try {
    if (fs.existsSync('/tmp/tunnel.log')) {
      const log = fs.readFileSync('/tmp/tunnel.log', 'utf8');
      const match = log.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match) {
        currentPublicUrl = match[0];
        return currentPublicUrl;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function startTunnelIfNeeded(): void {
  if (!fs.existsSync('/tmp/cloudflared')) {
    return;
  }

  // Check if already running
  if (tunnelProcess && !tunnelProcess.killed) {
    return;
  }

  try {
    const fd = fs.openSync('/tmp/tunnel.log', 'a');
    tunnelProcess = spawn('/tmp/cloudflared', ['tunnel', '--protocol', 'http2', '--url', 'http://localhost:3000'], {
      detached: true,
      stdio: ['ignore', fd, fd]
    });

    tunnelProcess.unref();

    console.log('[TunnelService] Cloudflared tunnel process started.');
  } catch (err) {
    console.error('[TunnelService] Failed to start cloudflared:', err);
  }
}
