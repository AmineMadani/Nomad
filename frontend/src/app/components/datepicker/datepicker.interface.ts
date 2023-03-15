import { DateTime } from "luxon";

export interface Day {
  number: number;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  date: DateTime;
}

export interface Month {
  name: string;
  days: Day[];
}

export interface Year {
  year: number;
  months: Month[];
}
