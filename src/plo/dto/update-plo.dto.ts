import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, MaxLength } from 'class-validator';

export class UpdatePloDto {
  @ApiProperty({
    example: 'PLO-1',
    description: 'PLO code (e.g., PLO-1, PLO-2)',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({
    example: 'Engineering Knowledge',
    description: 'PLO title',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    example: 'Apply knowledge of mathematics, science, engineering fundamentals...',
    description: 'PLO description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Program ID',
    required: false,
  })
  @IsOptional()
  @IsInt()
  program_id?: number;
}
