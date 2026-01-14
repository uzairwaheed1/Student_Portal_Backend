import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, MaxLength } from 'class-validator';

export class CreatePloDto {
  @ApiProperty({
    example: 'PLO-1',
    description: 'PLO code (e.g., PLO-1, PLO-2)',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Engineering Knowledge',
    description: 'PLO title',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Apply knowledge of mathematics, science, engineering fundamentals...',
    description: 'PLO description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 1,
    description: 'Program ID',
  })
  @IsNotEmpty()
  @IsInt()
  program_id: number;
}
