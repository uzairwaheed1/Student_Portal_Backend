import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity('faculty_profiles')
  export class FacultyProfile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', unique: true })
    user_id: number;
  
    @Column({ type: 'varchar', length: 255 })
    full_name: string;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    employee_id: string;
  
    @Column({ type: 'varchar', length: 100 })
    department: string;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  }