import { EventStatus } from "./EventStatus";

export interface Event {
    id?: number;                
    scheduleTime: Date;        
    title: string;             
    description: string;
    idCalendar: number;       
    status: EventStatus;            
 }
 
