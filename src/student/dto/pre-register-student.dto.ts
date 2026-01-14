import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class PreRegisterStudentDto {
  @ApiProperty({
    example: '2024-CHEM-001',
    description: 'Student roll number',
  })
  @IsNotEmpty()
  @IsString()
  roll_no: string;

  @ApiProperty({
    example: 1,
    description: 'Batch ID',
  })
  @IsNotEmpty()
  @IsInt()
  batch_id: number;
}