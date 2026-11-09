// P28.5-E10: Transform שמפרק NDJSON לאובייקטים — גם כש־chunk נחתך באמצע שורה, ובאמצע תו
import { Transform } from "node:stream";
import { StringDecoder } from "node:string_decoder";

export function ndjsonParser(): Transform {
  throw new Error("עוד לא כתבת את הפתרון");
}
