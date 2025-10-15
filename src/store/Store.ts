export interface Chat { 
    id: string;
    message: string;
    user: string;
    timestamp: Date;
    upvotes: string;
}


export abstract class Store { 
    constructor() {

    }
    initroom(room: string) {

    }
    getchats(room: string,limit: number ,offset: number) {          
        // This function should return the last 'limit' messages from the specified room
        // For now, we will return an empty array
        return [];
    }
    getrooms() {
        // This function should return a list of all rooms
        // For now, we will return an empty array
        return [];
    }
    addchat(room: string, chat: any) {
        // This function should add a chat message to the specified room
        // For now, we will just log the chat message
        console.log(`Adding chat to room ${room}:`, chat);
    }
    upvote(room: string, chatId: string) {
        // This function should upvote a chat message in the specified room
        // For now, we will just log the upvote action
        console.log(`Upvoting chat ${chatId} in room ${room}`);
    }
}