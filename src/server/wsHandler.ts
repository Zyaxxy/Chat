// server/wsHandler.ts
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type { BaseMessage, ChatMessage, SendRoomPayload, SendPrivatePayload, AckPayload } from '../shared/type';
import { addUser, removeUser, joinRoom, leaveRoom, users, rooms } from '../InMemoryStore';

function sendSafe(ws: WebSocket, obj: any) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

export function handleConnection(ws: WebSocket, userId: string) {
  addUser(userId, ws);

  ws.on('message', (data) => {
    let msg: BaseMessage;
    try { msg = JSON.parse(String(data)); } catch { sendSafe(ws, { action: 'error', payload: { message: 'invalid json' }}); return; }

    switch (msg.action) {
      case 'join_room': {
        const p = msg.payload as { roomId: string };
        joinRoom(userId, p.roomId);
        break;
      }
      case 'leave_room': {
        const p = msg.payload as { roomId: string };
        leaveRoom(userId, p.roomId);
        break;
      }
      case 'send_room': {
        const p = msg.payload as SendRoomPayload;
        const serverMsg: ChatMessage = {
          id: uuidv4(),
          from: userId,
          roomId: p.roomId,
          content: p.content,
          createdAt: Date.now(),
          clientMsgId: p.clientMsgId
        };
        const ack = { action: 'ack', payload: { clientMsgId: p.clientMsgId, serverId: serverMsg.id, createdAt: serverMsg.createdAt } as AckPayload };
        sendSafe(ws, ack);

        const members = rooms.get(p.roomId);
        if (!members) break;
        for (const uid of members) {
          const conn = users.get(uid);
          if (!conn) continue;
          sendSafe(conn, { action: 'message', payload: serverMsg });
        }
        break;
      }
      case 'send_private': {
        const p = msg.payload as SendPrivatePayload;
        const serverMsg: ChatMessage = {
          id: uuidv4(),
          from: userId,
          toUserId: p.toUserId,
          content: p.content,
          createdAt: Date.now(),
          clientMsgId: p.clientMsgId
        };
        sendSafe(ws, { action: 'ack', payload: { clientMsgId: p.clientMsgId, serverId: serverMsg.id, createdAt: serverMsg.createdAt } as AckPayload });
        const recipient = users.get(p.toUserId);
        if (recipient) sendSafe(recipient, { action: 'message', payload: serverMsg });
        // offline: dropped in this MVP
        break;
      }
      default:
        sendSafe(ws, { action: 'error', payload: { message: 'unknown action' }});
    }
  });

  ws.on('close', () => { removeUser(userId); });
}
