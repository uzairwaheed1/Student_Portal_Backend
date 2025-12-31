import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';

export class UpdateBatchDto {
  @ApiProperty({
    example: 'B24-Updated',
    description: 'Batch name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Inactive',
    description: 'Batch status',
    enum: ['Active', 'Graduated', 'Inactive'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Active', 'Graduated', 'Inactive'])
  status?: string;

  @ApiProperty({
    example: 1,
    description: 'Program ID (optional, can be null to remove association)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  program_id?: number | null;
}
