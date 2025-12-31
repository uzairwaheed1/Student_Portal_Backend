import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Batch } from '../../batch/entities/batch.entity';
import { Plo } from '../../plo/entities/plo.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // e.g. CHE

  @Column()
  name: string; // Chemical Engineering

  @Column()
  department: string; // Chemical Engineering Dept

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  /* RELATIONS */

  @OneToMany(() => Batch, (batch) => batch.program)
  batches: Batch[];

  @OneToMany(() => Plo, (plo) => plo.program)
  plos: Plo[];

  @OneToMany(() => Course, (course) => course.program)
  courses: Course[];
}
