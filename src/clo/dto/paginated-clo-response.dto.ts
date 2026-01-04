// ============================================
// FILE: dto/paginated-clo-response.dto.ts
// ============================================
import { ApiProperty } from '@nestjs/swagger';
import { CloResponseDto } from './clo-response.dto';

export class PaginatedCloResponseDto {
  @ApiProperty({ type: [CloResponseDto] })
  data: CloResponseDto[];

  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}