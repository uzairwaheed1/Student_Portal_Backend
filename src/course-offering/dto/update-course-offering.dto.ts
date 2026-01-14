import { IsOptional, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCourseOfferingDto {
  @IsOptional()
  @IsInt({ message: 'Instructor ID must be an integer' })
  @IsPositive({ message: 'Instructor ID must be positive' })
  @Type(() => Number)
  instructor_id?: number;
}