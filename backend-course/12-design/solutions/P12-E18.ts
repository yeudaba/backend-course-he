// P12-E18
export type UserRecord = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  created_at: Date;
  is_deleted: boolean;
};

export type UserResponse = { id: number; email: string; displayName: string; memberSince: string };

export function toUserResponse(r: UserRecord): UserResponse {
  return {
    id: r.id,
    email: r.email,
    displayName: `${r.first_name} ${r.last_name}`,
    memberSince: r.created_at.toISOString().slice(0, 10),
  };
}

export function toUserResponses(records: UserRecord[]): UserResponse[] {
  return records.filter((r) => !r.is_deleted).map(toUserResponse);
}

console.log(
  toUserResponse({
    id: 1,
    email: "d@x.com",
    first_name: "דנה",
    last_name: "כהן",
    password_hash: "$2b$10$...",
    created_at: new Date("2026-03-05T12:00:00Z"),
    is_deleted: false,
  })
);
