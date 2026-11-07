// P11-E09
export type User = {
  firstName?: string;
  nickname?: string;
  address?: { city?: string };
  phones?: string[];
};

export function displayName(u: User): string {
  return u.nickname || u.firstName || "אורח";
}

export function cityOf(u: User): string {
  return u.address?.city ?? "לא ידוע";
}

export function phoneCount(u: User): number {
  return u.phones?.length ?? 0;
}

console.log(displayName({ nickname: "", firstName: "דנה" }), cityOf({}), phoneCount({ phones: ["1"] }));
