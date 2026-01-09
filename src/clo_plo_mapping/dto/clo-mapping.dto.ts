import { IsInt, IsArray, ValidateNested, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PloMappingItemDto } from './plo-mapping-item.dto';

export class CloMappingDto {
  @ApiProperty({
    description: 'CLO ID',
    example: 12,
    type: Number,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  clo_id: number;

  @ApiProperty({
    description: 'Array of PLO mappings for this CLO (can be empty)',
    type: [PloMappingItemDto],
    example: [
      { plo_id: 1, domain: 'C', level: 2, weightage: 0.8 },
      { plo_id: 3, domain: 'C', level: 3, weightage: 0.6 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PloMappingItemDto)
  plo_mappings: PloMappingItemDto[];
}