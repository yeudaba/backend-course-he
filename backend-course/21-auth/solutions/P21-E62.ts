// P21-E62: single-flight — refresh אחד בכל פעם
export function createRefresher(doRefresh: () => Promise<string>): () => Promise<string> {
  let inFlight: Promise<string> | null = null;
  return () => {
    if (inFlight === null) {
      inFlight = doRefresh().finally(() => {
        inFlight = null;
      });
    }
    return inFlight;
  };
}
