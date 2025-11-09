// ============================================
// FILE: auth/dto/auth-response.dto.ts
// ============================================


export class AuthResponseDto {
  access_token: string;
  refresh_token?: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified: boolean;
    account_status: string;
  };
}