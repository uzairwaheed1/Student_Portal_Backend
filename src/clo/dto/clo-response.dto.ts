// ============================================
// FILE: dto/clo-response.dto.ts
// ============================================
import { ApiProperty } from '@nestjs/swagger';

export class CloResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  course_id: number;

  @ApiProperty({ example: 1 })
  clo_number: number;

  @ApiProperty({ example: 'Students will understand chemical bonding principles' })
  description: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updated_at: Date;

  @ApiProperty({
    description: 'Associated course details',
    required: false,
    example: {
      id: 1,
      code: 'CE-301',
      title: 'Applied Chemistry-I',
    },
  })
  course?: {
    id: number;
    code: string;
    title: string;
  };
}
