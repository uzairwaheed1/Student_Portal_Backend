import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('courses')
  export class Course {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    code: string; // e.g., "CHEM-301"
  
    @Column({ type: 'varchar', length: 255 })
    title: string;
  
    @Column({ type: 'int' })
    credit_hours: number;
  
    @Column({ type: 'int', default: 60 })
    theory_percentage: number; // 60% for terminal exam
  
    @Column({ type: 'int', default: 40 })
    lab_percentage: number; // 40% for lab/sessional
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  }