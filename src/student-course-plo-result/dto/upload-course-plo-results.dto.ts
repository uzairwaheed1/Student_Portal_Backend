import { IsNotEmpty, IsString, IsInt, IsArray, ValidateNested, IsOptional, IsNumber, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentCoursePloDataDto {
  @IsNotEmpty()
  @IsString()
  roll_no: string;

  @IsNotEmpty()
  @IsString()
  student_name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo1?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo3?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo4?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo5?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo6?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo7?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo8?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo9?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo10?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo11?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  plo12?: number;
}

export class UploadCoursePloResultsDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  course_offering_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentCoursePloDataDto)
  students: StudentCoursePloDataDto[];
}