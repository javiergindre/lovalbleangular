import { EntityType } from "../entityType/entityType";

export interface CalendarRq {
    entityType: EntityType;
    entityId: number;
    name: string;
}
