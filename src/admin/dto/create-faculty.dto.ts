// ============================================
// FILE: src/admin/dto/create-faculty.dto.ts
// ============================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({
    example: 'Dr. Salman Iqbal',
    description: 'Full name of the faculty member',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'salman.iqbal@obe.edu.pk',
    description: 'Official email for sending the invitation link',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'Assistant Professor',
    description: 'Designation/title of the faculty',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    example: 'Electrical Engineering',
    description: 'Department name',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    example: '2024-02-15',
    description: 'Date of joining in ISO format',
  })
  @IsOptional()
  @IsDateString()
  joining_date?: string;
}
