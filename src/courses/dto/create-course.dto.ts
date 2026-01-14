import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: 'CHE-101',
    description: 'Course code (e.g., CHE-101, CS-201)',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  course_code: string;

  @ApiProperty({
    example: 'Introduction to Chemical Engineering',
    description: 'Course name',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  course_name: string;

  @ApiProperty({
    example: 'This course introduces fundamental concepts of chemical engineering...',
    description: 'Course description',
    required: false,
  })
  @IsOptional()
  @IsString()
  course_description?: string;

  @ApiProperty({
    example: 3.0,
    description: 'Credit hours (e.g., 3.0, 2.5)',
    minimum: 0.5,
    maximum: 6.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.5)
  @Max(6.0)
  credit_hours: number;

  @ApiProperty({
    example: 1,
    description: 'Program ID',
  })
  @IsNotEmpty()
  @IsInt()
  program_id: number;

  @ApiProperty({
    example: 1,
    description: 'Semester number (1-8) where this course is typically offered',
    minimum: 1,
    maximum: 8,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  semester_number?: number;

  @ApiProperty({
    example: 'Core',
    description: 'Course type (Core, Elective, Lab, Project, etc.)',
    enum: ['Core', 'Elective', 'Lab', 'Project', 'Thesis', 'Other'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  course_type?: string;
}
