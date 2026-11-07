// מזהים להזרקה — לתלויות שאינן class (interface, ערך)
export const TASKS_REPOSITORY = "TASKS_REPOSITORY";
export const CLOCK = "CLOCK";

export interface Clock {
  now(): Date;
}
