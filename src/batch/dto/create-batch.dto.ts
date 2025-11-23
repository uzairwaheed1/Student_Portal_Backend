import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, Min, Max } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({
    example: 'B24',
    description: 'Batch name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 2024,
    description: 'Batch year',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({
    example: 15,
    description: 'Semester start day of month',
    minimum: 1,
    maximum: 31,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(31)
  semester_start_day: number;

  @ApiProperty({
    example: 1,
    description: 'Semester start month (1=Jan, 7=Jul)',
    minimum: 1,
    maximum: 12,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  semester_start_month: number;

  @ApiProperty({
    example: 30,
    description: 'Semester end day of month',
    minimum: 1,
    maximum: 31,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(31)
  semester_end_day: number;

  @ApiProperty({
    example: 6,
    description: 'Semester end month (1=Jan, 6=Jun, 12=Dec)',
    minimum: 1,
    maximum: 12,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  semester_end_month: number;
}
