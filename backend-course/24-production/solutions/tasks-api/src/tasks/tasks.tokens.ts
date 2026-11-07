// מזהים להזרקה — לתלויות שאינן class (interface, ערך)
export const TASKS_REPOSITORY = "TASKS_REPOSITORY";
// CLOCK עבר ל־config.ts (משותף גם ל־auth); מיוצא גם מכאן כדי שה־imports הקיימים ימשיכו לעבוד
export { CLOCK, type Clock } from "../config";
