import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { CourseOffering } from '../../courses/entities/course-offering.entity';
  
  @Entity('clos')
  export class CLO {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    course_offering_id: number;
  
    @Column({ type: 'varchar', length: 50 })
    code: string; // e.g., "CLO-1"
  
    @Column({ type: 'text' })
    description: string;
  
    @Column({ type: 'varchar', length: 50, nullable: true })
    bloom_level: string; // e.g., "Remembering", "Understanding", "Applying"
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @ManyToOne(() => CourseOffering)
    @JoinColumn({ name: 'course_offering_id' })
    courseOffering: CourseOffering;
  }