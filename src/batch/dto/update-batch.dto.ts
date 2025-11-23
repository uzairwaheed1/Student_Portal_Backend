import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

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
}
