import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloPloMappingService } from './clo_plo_mapping.service';
import { CloPloMappingController } from './clo_plo_mapping.controller';
import { CloPloMapping } from './entities/clo-plo-mapping.entity';
import { Clo } from '../clo/entities/clo.entity';
import { Plo } from '../plo/entities/plo.entity';
import { Course } from '../courses/entities/course.entity';
import { ActivityLog } from '../admin/entities/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CloPloMapping, Clo, Plo, Course, ActivityLog]),
  ],
  controllers: [CloPloMappingController],
  providers: [CloPloMappingService],
  exports: [CloPloMappingService],
})
export class CloPloMappingModule {}