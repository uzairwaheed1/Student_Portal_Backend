import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProgramDto {
  @ApiProperty({
    example: 'CHE',
    description: 'Program code (e.g., CHE for Chemical Engineering)',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    example: 'Chemical Engineering',
    description: 'Program name',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    example: 'Chemical Engineering Department',
    description: 'Department name',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  department?: string;
}
