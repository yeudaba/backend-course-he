// P11-E76: הודעה מכל שגיאה
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string" && err !== "") return err;
  if (typeof err === "object" && err !== null && "message" in err && typeof err.message === "string") {
    return err.message;
  }
  return "שגיאה לא ידועה";
}

for (const thrown of [new RangeError("מחוץ לטווח"), "נגמר המלאי", { message: "מהשרת" }, 42, null]) {
  try {
    throw thrown;
  } catch (err) {
    console.log(errorMessage(err));
  }
}
