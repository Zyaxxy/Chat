// src/index.ts
import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { signToken, verifyToken } from './server/auth';
import { handleConnection } from './server/wsHandler';

const app = express();
app.use(bodyParser.json());

// ----------- HTTP routes ------------

// POST /login { "userId": "alice" } -> { token }
app.post('/login', (req, res) => {
  const userId = String(req.body.userId ?? '').trim();
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const token = signToken(userId);
  res.json({ token });
});

// GET /whoami (protected)
app.get('/whoami', (req, res) => {
  const auth = req.header('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
  const sub = verifyToken(token);
  if (!sub) return res.status(401).json({ error: 'unauthorized' });
  res.json({ userId: sub });
});

// ----------- HTTP server + WebSocket ------------

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Guard to prevent double registration
if (!(server as any)._upgradeRegistered) {
  server.on(
    'upgrade',
    (req: IncomingMessage, socket: Socket, head: Buffer) => {
      try {
        console.log('Upgrade request:', req.url);

        const url = new URL(req.url ?? '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token') ?? undefined;
        const userId = verifyToken(token);

        if (!userId) {
          console.log('Invalid token, closing socket');
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
          wss.emit('connection', ws, userId);
        });
      } catch (err) {
        console.log('Error handling upgrade request:', err);
        socket.destroy();
      }
    }
  );

  (server as any)._upgradeRegistered = true;
}

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, userId?: string) => {
  if (!userId) {
    ws.close();
    return;
  }
  // optional initial handshake message
  ws.send(JSON.stringify({ action: 'connected', payload: { userId } }));
  handleConnection(ws, userId);
});

// ----------- server Start  ------------

const PORT = Number(process.env.PORT ?? 8080);
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
