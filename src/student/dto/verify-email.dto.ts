import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'a7b3c4d5-1234-5678-abcd-ef1234567890',
    description: 'Email verification token from email',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  token: string;
}
