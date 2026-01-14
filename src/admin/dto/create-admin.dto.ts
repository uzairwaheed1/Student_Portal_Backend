import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'Ayesha Khan',
    description: 'Full name of the admin user',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ayesha.khan@obe.edu.pk',
    description: 'Unique email address for login invitation',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'Director Academics',
    description: 'Job title or designation of the admin user',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    example: 'Computer Science',
    description: 'Department to which the admin belongs',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    example: '+92-300-1112233',
    description: 'Contact number of the admin',
  })
  @IsOptional()
  @IsString()
  contact_no?: string;
}

