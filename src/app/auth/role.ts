export type Role = 'USER' | 'ADMIN';

export const RoleOrdering: { [r in Role]: number } = {
  USER: 0,
  ADMIN: 1
};

export function roleOrdinal(r: Role): number {
  return RoleOrdering[r];
}
