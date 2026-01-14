import { IsNotEmpty, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseOfferingDto {
  @IsNotEmpty({ message: 'Course ID is required' })
  @IsInt({ message: 'Course ID must be an integer' })
  @IsPositive({ message: 'Course ID must be positive' })
  @Type(() => Number)
  course_id: number;

  @IsNotEmpty({ message: 'Semester ID is required' })
  @IsInt({ message: 'Semester ID must be an integer' })
  @IsPositive({ message: 'Semester ID must be positive' })
  @Type(() => Number)
  semester_id: number;

  @IsNotEmpty({ message: 'Instructor ID is required' })
  @IsInt({ message: 'Instructor ID must be an integer' })
  @IsPositive({ message: 'Instructor ID must be positive' })
  @Type(() => Number)
  instructor_id: number;
}

// export class CourseOfferingResponseDto {
//     id: number;
//     course_id: number;
//     course_code: string;
//     course_title: string;
//     // course: course{};
//     semester_id: number;
//     semester_number: number;
//     batch_name: string;
//     instructor_id: number;
//     instructor_name: string;
//     instructor_email: string;
//     created_at: Date;
//   }


export class CourseOfferingResponseDto {
  id: number;

  course_id: number;
  course_code: string;
  course_title: string;

  semester_id: number;
  semester_number: number;

  batch_name: string;

  instructor_id: number;
  instructor_name: string;
  instructor_email: string;

  created_at: Date;

  course: {
    id: number;
    course_code: string;
    course_name: string;
    program_id: number;
  };

  semester: {
    id: number;
    number: number;
    batch_id: number;
  };

  batch: {
    id: number;
    name: string;
    program_id: number | null;
  };

  instructor: {
    id: number; // FacultyProfile.id
    name: string;
    email: string;
  };
}
