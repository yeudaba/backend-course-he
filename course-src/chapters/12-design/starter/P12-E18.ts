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

// memberSince = created_at.toISOString().slice(0, 10)
export function toUserResponse(r: UserRecord): UserResponse {
  // כתוב כאן
}

// בלי מחוקים
export function toUserResponses(records: UserRecord[]): UserResponse[] {
  // כתוב כאן
}
