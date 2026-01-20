import { IsNotEmpty, IsString, IsInt, IsArray, ValidateNested, IsOptional, IsNumber, Min, Max, IsPositive, ArrayMinSize } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Helper function to transform PLO values (handles null, undefined, empty string)
const transformPloValue = ({ value }: { value: any }) => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export class StudentCoursePloDataDto {
  @IsNotEmpty()
  @IsString()
  roll_no: string;

  @IsNotEmpty()
  @IsString()
  student_name: string;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO1 must be a number' })
  @Min(0, { message: 'PLO1 must be at least 0' })
  @Max(100, { message: 'PLO1 must be at most 100' })
  plo1?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO2 must be a number' })
  @Min(0, { message: 'PLO2 must be at least 0' })
  @Max(100, { message: 'PLO2 must be at most 100' })
  plo2?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO3 must be a number' })
  @Min(0, { message: 'PLO3 must be at least 0' })
  @Max(100, { message: 'PLO3 must be at most 100' })
  plo3?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO4 must be a number' })
  @Min(0, { message: 'PLO4 must be at least 0' })
  @Max(100, { message: 'PLO4 must be at most 100' })
  plo4?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO5 must be a number' })
  @Min(0, { message: 'PLO5 must be at least 0' })
  @Max(100, { message: 'PLO5 must be at most 100' })
  plo5?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO6 must be a number' })
  @Min(0, { message: 'PLO6 must be at least 0' })
  @Max(100, { message: 'PLO6 must be at most 100' })
  plo6?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO7 must be a number' })
  @Min(0, { message: 'PLO7 must be at least 0' })
  @Max(100, { message: 'PLO7 must be at most 100' })
  plo7?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO8 must be a number' })
  @Min(0, { message: 'PLO8 must be at least 0' })
  @Max(100, { message: 'PLO8 must be at most 100' })
  plo8?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO9 must be a number' })
  @Min(0, { message: 'PLO9 must be at least 0' })
  @Max(100, { message: 'PLO9 must be at most 100' })
  plo9?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO10 must be a number' })
  @Min(0, { message: 'PLO10 must be at least 0' })
  @Max(100, { message: 'PLO10 must be at most 100' })
  plo10?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO11 must be a number' })
  @Min(0, { message: 'PLO11 must be at least 0' })
  @Max(100, { message: 'PLO11 must be at most 100' })
  plo11?: number;

  @IsOptional()
  @Transform(transformPloValue)
  @IsNumber({}, { message: 'PLO12 must be a number' })
  @Min(0, { message: 'PLO12 must be at least 0' })
  @Max(100, { message: 'PLO12 must be at most 100' })
  plo12?: number;
}

export class UploadCoursePloResultsDto {
  @IsNotEmpty({ message: 'Course offering ID is required' })
  @IsInt({ message: 'Course offering ID must be an integer' })
  @IsPositive({ message: 'Course offering ID must be positive' })
  @Type(() => Number)
  course_offering_id: number;

  @IsArray({ message: 'Students array is required' })
  @ArrayMinSize(1, { message: 'Students array must contain at least one student' })
  @ValidateNested({ each: true })
  @Type(() => StudentCoursePloDataDto)
  students: StudentCoursePloDataDto[];
}