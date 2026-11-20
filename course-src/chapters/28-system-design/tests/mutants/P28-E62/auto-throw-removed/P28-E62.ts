// P28-E62: איזה אורך קוד?
export function collisionChance(existing: number, length: number): number {
  return Math.min(1, existing / 62 ** length);
}

export function codeLengthFor(totalLinks: number, maxChance: number): number {

  let length = 1;
  while (collisionChance(totalLinks, length) > maxChance) length++;
  return length;
}
