import { IsNotEmpty, IsString, MinLength, IsUUID } from 'class-validator';

export class AcceptInvitationDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}