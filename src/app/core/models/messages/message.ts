export interface Message {
    Body: string;
    CreateDate : Date;
    ReplyToMessageId? : number;
    MessageThreadId? : number;
  }
  