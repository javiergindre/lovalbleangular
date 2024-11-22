import { Message } from "./message";

export interface MessageRequest {
    Message: Message;
    UserName : string;
    IdCategory?: number;
    IdCategoryEntity?: number;
  }