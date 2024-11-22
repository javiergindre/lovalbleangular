import { StatisticsByDayDetail } from "./StaticByDayDetail";

export interface StatisticsByDay {
    day: Date;
    details: StatisticsByDayDetail[];
}