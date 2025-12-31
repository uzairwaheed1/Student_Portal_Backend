import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Semester } from '../../semester/entities/semester.entity';
import { Program } from '../../program/entities/program.entity';
  
  @Entity('batches')
  export class Batch {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;
  
    @Column({ type: 'int' })
    year: number;
  
    @Column({ type: 'int', default: 1 })
    current_semester: number;
  
    @Column({ type: 'int' })
    semester_start_day: number; // Day of month (e.g., 15)
  
    @Column({ type: 'int' })
    semester_start_month: number; // Month (1-12)
  
    @Column({ type: 'int' })
    semester_end_day: number;
  
    @Column({ type: 'int' })
    semester_end_month: number;
  
    @Column({ type: 'varchar', length: 20, default: 'Active' })
    status: string; // 'Active', 'Graduated', 'Inactive'
  
    @Column({ type: 'int' })
    created_by: number;

    @Column({ type: 'int', nullable: true })
    program_id: number | null;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @OneToMany(() => Semester, (semester) => semester.batch)
    semesters: Semester[];

    @ManyToOne(() => Program, (program) => program.batches)
    @JoinColumn({ name: 'program_id' })
    program: Program;
  }
  