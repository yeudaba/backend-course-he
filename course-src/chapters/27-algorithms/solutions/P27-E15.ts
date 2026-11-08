// P27-E15
// BFS: מתקדמים "בגלים" — כל התאים במרחק 1, אחר כך 2... הפעם הראשונה שמגיעים ל־E היא הקצרה ביותר
export function shortestPath(grid: readonly string[]): number {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  let start: [number, number] | null = null;
  for (let y = 0; y < h; y++) {
    const x = grid[y].indexOf("S");
    if (x !== -1) start = [x, y];
  }
  if (!start) return -1;
  const dist = new Map<number, number>([[start[1] * w + start[0], 0]]); // מסמנים כשנכנסים לתור, לא כשיוצאים
  const queue: [number, number][] = [start];
  for (let head = 0; head < queue.length; head++) { // אינדקס במקום shift(): לא מזיזים כלום, גם כשהתור ענק
    const [x, y] = queue[head];
    const d = dist.get(y * w + x)!;
    if (grid[y][x] === "E") return d;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || grid[ny][nx] === "#" || dist.has(ny * w + nx)) continue;
      dist.set(ny * w + nx, d + 1);
      queue.push([nx, ny]);
    }
  }
  return -1;
}
