// ============================================
// FILE: dto/update-clo.dto.ts
// ============================================
import { IsOptional, IsInt, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCloDto {
  @ApiProperty({
    description: 'CLO number (e.g., 1 for CLO-1, 2 for CLO-2)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  clo_number?: number;

  @ApiProperty({
    description: 'Detailed description of the Course Learning Outcome',
    example: 'Students will be able to analyze and evaluate chemical reaction mechanisms',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
