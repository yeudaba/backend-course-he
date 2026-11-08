// P27-E08
// מפתח קנוני לכל קבוצה: האותיות ממוינות. Map שומר את סדר ההוספה — כלומר סדר ההופעה הראשונה
export function groupAnagrams(words: readonly string[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const word of words) {
    const key = [...word.toLowerCase()].sort().join("");
    const group = groups.get(key);
    if (group) group.push(word);
    else groups.set(key, [word]);
  }
  return [...groups.values()];
}
