import { EntityType } from "../entityType/entityType";
import { EventStatus } from "./EventStatus";

export interface EventEntityDto {
    scheduleTime: Date;
    title: string;
    description: string;
    calendarId: number;
    entityId: number;
    entityType: EntityType;
    status: EventStatus;
}