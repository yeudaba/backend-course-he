// P27-E22: "המסלול לא הכי קצר, לפעמים עובר דרך קירות, ו'אין דרך' נראה כמו 'הגעת'" — שלוש תקלות
export function shortestPath(grid: readonly string[]): number {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  let start: [number, number] | null = null;
  for (let y = 0; y < h; y++) {
    const x = grid[y].indexOf("S");
    if (x !== -1) start = [x, y];
  }
  if (!start) return -1;
  const dist = new Map<string, number>([[`${start[0]},${start[1]}`, 0]]);
  const queue: [number, number][] = [start];
  while (queue.length) {
    const [x, y] = queue.pop()!;
    const d = dist.get(`${x},${y}`)!;
    if (grid[y][x] === "E") return d;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx > w || ny > h || grid[ny]?.[nx] === "#" || dist.has(`${nx},${ny}`)) continue;
      dist.set(`${nx},${ny}`, d + 1);
      queue.push([nx, ny]);
    }
  }
  return 0;
}
