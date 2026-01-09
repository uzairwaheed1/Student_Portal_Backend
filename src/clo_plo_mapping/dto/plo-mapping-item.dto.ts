import {
    IsInt,
    IsIn,
    IsNumber,
    Min,
    Max,
    IsNotEmpty,
    ValidateIf,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class PloMappingItemDto {
    @ApiProperty({
      description: 'PLO ID to map to',
      example: 1,
      type: Number,
    })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    plo_id: number;
  
    @ApiProperty({
      description: "Bloom's Taxonomy Domain",
      enum: ['C', 'P', 'A'],
      example: 'C',
    })
    @IsNotEmpty()
    @IsIn(['C', 'P', 'A'], {
      message: 'Domain must be C (Cognitive), P (Psychomotor), or A (Affective)',
    })
    domain: string;
  
    @ApiProperty({
      description: "Bloom's Taxonomy Level (1-6 for C, 1-7 for P, 1-5 for A)",
      example: 2,
      minimum: 1,
      maximum: 7,
    })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(7)
    level: number;
  
    @ApiProperty({
      description: 'Weightage/contribution (0.0 - 1.0)',
      example: 0.8,
      minimum: 0,
      maximum: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(1)
    weightage: number;
  }
  