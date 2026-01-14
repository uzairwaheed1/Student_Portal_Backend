import { IsInt, IsArray, ValidateNested, Min, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CloMappingDto } from './clo-mapping.dto';

export class BulkCloPloMappingDto {
  @ApiProperty({
    description: 'Course ID - All mappings are created in context of this course',
    example: 5,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  course_id: number;

  @ApiProperty({
    description: 'Array of CLO mappings',
    type: [CloMappingDto],
    example: [
      {
        clo_id: 12,
        plo_mappings: [
          { plo_id: 1, domain: 'C', level: 2, weightage: 0.8 },
          { plo_id: 3, domain: 'C', level: 3, weightage: 0.6 },
        ],
      },
      {
        clo_id: 13,
        plo_mappings: [{ plo_id: 5, domain: 'C', level: 3, weightage: 0.7 }],
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one CLO mapping is required' })
  @ValidateNested({ each: true })
  @Type(() => CloMappingDto)
  mappings: CloMappingDto[];
}
