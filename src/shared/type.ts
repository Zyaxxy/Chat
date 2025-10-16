// shared/types.ts
export type UserId = string;
export type RoomId = string;
export type ServerMsgId = string;

export type Action =
  | 'join_room'
  | 'leave_room'
  | 'send_room'
  | 'send_private'
  | 'typing'
  | 'ack'
  | 'error'
  | 'message';

export interface BaseMessage { action: Action; payload?: any; }

export interface SendRoomPayload { roomId: RoomId; clientMsgId?: string; content: string; }
export interface SendPrivatePayload { toUserId: UserId; clientMsgId?: string; content: string; }

export interface ChatMessage {
  id: ServerMsgId;
  from: UserId;
  roomId?: RoomId;
  toUserId?: UserId;
  content: string;
  createdAt: number;
  clientMsgId?: string;
}

export interface AckPayload { clientMsgId?: string; serverId: ServerMsgId; createdAt: number; }
