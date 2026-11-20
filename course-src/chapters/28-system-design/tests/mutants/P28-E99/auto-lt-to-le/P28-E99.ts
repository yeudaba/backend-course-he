// P28-E99: fan-out בתור, בחבילות
export function fanoutJobs(postId: number, followers: string[], batchSize = 1000) {
  if (!Number.isInteger(batchSize) || batchSize <= 0) throw new RangeError("batchSize חייב להיות שלם חיובי");
  const unique = [...new Set(followers)];
  const jobs: { name: string; data: { postId: number; followers: string[] }; opts: { jobId: string } }[] = [];
  for (let i = 0; i <= unique.length; i += batchSize) {
    jobs.push({
      name: "fanout",
      data: { postId, followers: unique.slice(i, i + batchSize) },
      opts: { jobId: `fanout:${postId}:${i / batchSize}` },
    });
  }
  return jobs;
}
