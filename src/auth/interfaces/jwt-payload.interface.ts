// ============================================
// FILE: auth/interfaces/jwt-payload.interface.ts
// ============================================
export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}