import { Chat, Store } from './store/Store';
export interface Room {
    roomId: string;
    chats: Chat[];
}
export class inMemoryStore implements Store {
    private store: Map<string, Room>; // Using a Map to store rooms by their roomId  
    constructor() {
        this.store=new Map<string, Room>(); 

    }
    initroom(roomId: string) {

    }
    getchats(roomId: string,limit: number ,offset: number) {          
        // This function should return the last 'limit' messages from the specified room
        // For now, we will return an empty array
        return [];
    }
    getrooms() {
        // This function should return a list of all rooms
        // For now, we will return an empty array
        return [];
    }
    addchat(roomId: string, chat: any) {
        // This function should add a chat message to the specified room
        // For now, we will just log the chat message
        console.log(`Adding chat to room ${roomId}:`, chat);
    }
    upvote(roomId: string, chatId: string) {
        // This function should upvote a chat message in the specified room
        // For now, we will just log the upvote action
        console.log(`Upvoting chat ${chatId} in room ${roomId}`);
    }
}