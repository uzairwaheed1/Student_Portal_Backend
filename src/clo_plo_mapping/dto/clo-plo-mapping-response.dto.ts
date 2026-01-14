import { ApiProperty } from '@nestjs/swagger';

export class CloPloMappingResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  course_id: number;

  @ApiProperty({ example: 12 })
  clo_id: number;

  @ApiProperty({ example: 1 })
  plo_id: number;

  @ApiProperty({ example: 'C' })
  domain: string;

  @ApiProperty({ example: 2 })
  level: number;

  @ApiProperty({ example: 0.8 })
  weightage: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  created_at: Date;
}

export class BulkMappingResponseDto {
    @ApiProperty({ example: 'CLO-PLO mappings created successfully' })
    message: string;
  
    @ApiProperty({ example: 5 })
    course_id: number;
  
    @ApiProperty({ example: 15 })
    total_mappings: number;
  
    @ApiProperty({ example: 5 })
    clos_mapped: number;
  
    @ApiProperty({ type: [CloPloMappingResponseDto] })
    mappings: CloPloMappingResponseDto[];
  }