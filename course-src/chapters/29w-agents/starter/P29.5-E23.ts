// P29.5-E23: תוכן לא אמין — שלוש תקלות
export function wrapUntrusted(source: string, text: string): string {
  return `<untrusted source="${source}">\n${text}\n</untrusted>`;
}

export function createTaintPolicy({ untrustedTools, sensitiveTools }: { untrustedTools: string[]; sensitiveTools: string[] }) {
  let tainted = false;
  return {
    afterTool(name: string) {
      tainted = untrustedTools.includes(name);
    },
    requiresApproval: (name: string) => tainted && untrustedTools.includes(name),
    get tainted() {
      return tainted;
    },
  };
}
