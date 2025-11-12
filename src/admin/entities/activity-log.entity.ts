 // ============================================
// FILE: src/entities/activity-log.entity.ts
// ============================================
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
  } from 'typeorm';
  import { User } from '../../entities/user.entity';
  
  @Entity('activity_logs')
  @Index(['user_id', 'timestamp'])
  export class ActivityLog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    user_id: number;
  
    @Column({ type: 'varchar', length: 100 })
    action: string; // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'CREATE_ADMIN', 'CREATE_FACULTY', etc.
  
    @Column({ type: 'varchar', length: 100 })
    entity: string; // 'User', 'Course', 'Assessment', etc.
  
    @Column({ type: 'jsonb', nullable: true })
    metadata: any; // Additional info (like: { admin_id: 5, admin_email: 'test@example.com' })
  
    @CreateDateColumn({ type: 'timestamp' })
    timestamp: Date;
  
    // Relationship with User
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
  }