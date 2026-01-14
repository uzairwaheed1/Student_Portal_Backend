import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class RegisterStudentDto {
  @ApiProperty({
    example: 'Ahmed Khan',
    description: 'Full name of the student',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ahmed.khan@student.edu',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Student@123',
    description: 'Password (minimum 8 characters)',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '2024-CHEM-001',
    description: 'Roll number (must be pre-registered by admin)',
  })
  @IsNotEmpty()
  @IsString()
  roll_no: string;

  @ApiProperty({
    example: 'Male',
    description: 'Gender',
    enum: ['Male', 'Female', 'Other'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: string;

  @ApiProperty({
    example: '2000-01-15',
    description: 'Date of birth',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({
    example: '+92-300-1234567',
    description: 'Contact number',
    required: false,
  })
  @IsOptional()
  @IsString()
  contact_no?: string;

  @ApiProperty({
    example: 'House 123, Street 45, Karachi',
    description: 'Residential address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'Muhammad Khan',
    description: "Father's name",
    required: false,
  })
  @IsOptional()
  @IsString()
  father_name?: string;

  @ApiProperty({
    example: '+92-300-9876543',
    description: "Father's contact number",
    required: false,
  })
  @IsOptional()
  @IsString()
  father_contact?: string;

  @ApiProperty({
    example: '+92-321-1234567',
    description: 'Emergency contact number',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergency_contact?: string;
}
