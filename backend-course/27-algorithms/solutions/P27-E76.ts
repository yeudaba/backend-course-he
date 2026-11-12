// P27-E76: פלינדרום במשפט — שני מצביעים
const ok = (ch: string) => /[\p{L}\p{N}]/u.test(ch);

export function isPalindromeSentence(s: string): boolean {
  let i = 0;
  let j = s.length - 1;
  while (i < j) {
    if (!ok(s[i])) i++;
    else if (!ok(s[j])) j--;
    else {
      if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
      i++;
      j--;
    }
  }
  return true;
}
