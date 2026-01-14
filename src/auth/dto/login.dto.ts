// ============================================
// FILE: auth/dto/login.dto.ts
// ============================================
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@obe.edu.pk',
    description: 'Email used during invitation/registration',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass123',
    description: 'Account password (minimum 6 characters)',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
