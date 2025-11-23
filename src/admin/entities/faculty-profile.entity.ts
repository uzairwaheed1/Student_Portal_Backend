// ============================================
// FILE: src/entities/faculty-profile.entity.ts
// ============================================
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    OneToOne,
  } from 'typeorm';
  import { User } from '../../entities/user.entity';
  
  @Entity('faculty_profiles')
  export class FacultyProfile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', unique: true })
    user_id: number;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    designation: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    department: string;
  
    @Column({ type: 'date', nullable: true })
    joining_date: Date;

    @Column({ type: 'boolean', default: false })
    email_verified: boolean;

    @Column({
      type: 'varchar',
      length: 20,
      default: 'pending'
    })
    account_status: string; // 'pending' | 'active' | 'suspended'

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    // Relationship with User
    @OneToOne(() => User, (user) => user.facultyProfile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    // If you have CourseFaculty entity, uncomment this:
    // @OneToMany(() => CourseFaculty, (cf) => cf.faculty)
    // courseFaculty: CourseFaculty[];
  
    // If you have Assessment entity, uncomment this:
    // @OneToMany(() => Assessment, (assessment) => assessment.faculty)
    // assessments: Assessment[];
  }
  

 