export interface MessageViewModel {
    id: number;
    name: string;
    senderId: number;
    body: string;
    createDate: Date;
    replies: MessageViewModel[]; 
    senderUserName : string;
  }
  
  export interface MessageThreadViewModel {
    id: number;
    createDate: Date; 
    mainMessage: MessageViewModel; 
  }
  