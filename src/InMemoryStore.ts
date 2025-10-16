// server/inMemoryStore.ts
import WebSocket from 'ws';
import type { UserId, RoomId } from './shared/type';

export const users = new Map<UserId, WebSocket>(); // single connection per user
export const rooms = new Map<RoomId, Set<UserId>>();

export function addUser(userId: UserId, ws: WebSocket) { users.set(userId, ws); }
export function removeUser(userId: UserId) {
  users.delete(userId);
  for (const [rid, set] of rooms) {
    if (set.has(userId)) {
      set.delete(userId);
      if (set.size === 0) rooms.delete(rid);
    }
  }
}
export function joinRoom(userId: UserId, roomId: RoomId) {
  const set = rooms.get(roomId) ?? new Set<UserId>();
  set.add(userId);
  rooms.set(roomId, set);
}
export function leaveRoom(userId: UserId, roomId: RoomId) {
  const set = rooms.get(roomId);
  if (!set) return;
  set.delete(userId);
  if (set.size === 0) rooms.delete(roomId);
}
