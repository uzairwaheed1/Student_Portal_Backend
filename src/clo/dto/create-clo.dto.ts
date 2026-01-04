import { IsNotEmpty, IsInt, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCloDto {
  @ApiProperty({
    description: 'Course ID to which this CLO belongs',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  course_id: number;

  @ApiProperty({
    description: 'CLO number (e.g., 1 for CLO-1, 2 for CLO-2)',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  clo_number: number;

  @ApiProperty({
    description: 'Detailed description of the Course Learning Outcome',
    example: 'Students will be able to understand and apply the principles of chemical bonding',
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;
}





