import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('clos')
@Index(['course_id', 'clo_number'], { unique: true })
export class Clo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_id' })
  course_id: number;

  @Column({ name: 'clo_number' })
  clo_number: number;

  @Column('text')
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}