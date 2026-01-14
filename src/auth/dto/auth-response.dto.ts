// ============================================
// FILE: auth/dto/auth-response.dto.ts
// ============================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Super Admin' })
  name: string;

  @ApiProperty({ example: 'super.admin@obe.edu.pk' })
  email: string;

  @ApiProperty({ example: 'SuperAdmin', description: 'Role assigned to the user' })
  role: string;

  @ApiProperty({ example: true, description: 'Indicates if email verification is complete' })
  email_verified: boolean;

  @ApiProperty({ example: 'Active', description: 'Account status (Active, Suspended, etc.)' })
  account_status: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token for authenticated requests' })
  access_token: string;

  @ApiPropertyOptional({ description: 'Refresh token when refresh flow is enabled' })
  refresh_token?: string;

  @ApiProperty({ type: AuthUserInfoDto })
  user: AuthUserInfoDto;
}