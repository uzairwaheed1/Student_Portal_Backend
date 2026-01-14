import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsUUID } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({
    example: '0d8b1efc-12a3-4b56-9c78-abc123456789',
    description: 'Invitation token received over email',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    example: 'Faculty@1234',
    description: 'New password to activate the account (min 8 characters)',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}