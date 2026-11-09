// P29.5-E23: תוכן לא אמין — אחרי התיקון
export function wrapUntrusted(source: string, text: string): string {
  // תיקון 3: תוכן שמנסה לסגור את התגית בעצמו — לא יוצא ממנה
  const safe = text.replace(/<\/?untrusted[^>]*>/gi, "[tag removed]");
  return `<untrusted source="${source.replace(/"/g, "")}">\n${safe}\n</untrusted>`;
}

export function createTaintPolicy({ untrustedTools, sensitiveTools }: { untrustedTools: string[]; sensitiveTools: string[] }) {
  let tainted = false; // תיקון 1: אחרי שתוכן לא אמין נכנס להקשר — הוא שם עד סוף השיחה
  return {
    afterTool(name: string) {
      if (untrustedTools.includes(name)) tainted = true;
    },
    // תיקון 2: הכלים הרגישים צריכים אישור — לא הכלים שמביאים תוכן
    requiresApproval: (name: string) => tainted && sensitiveTools.includes(name),
    get tainted() {
      return tainted;
    },
  };
}
