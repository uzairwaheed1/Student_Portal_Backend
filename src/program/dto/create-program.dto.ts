import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProgramDto {
  @ApiProperty({
    example: 'CHE',
    description: 'Program code (e.g., CHE for Chemical Engineering)',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({
    example: 'Chemical Engineering',
    description: 'Program name',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Chemical Engineering Department',
    description: 'Department name',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  department: string;
}
