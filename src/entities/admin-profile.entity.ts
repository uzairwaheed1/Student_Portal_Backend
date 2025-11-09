// ============================================
// FILE: src/entities/admin-profile.entity.ts (UPDATED)
// ============================================
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';


@Entity('admin_profiles')
export class AdminProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  designation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_no: string;

  // NEW COLUMN for super admin flag
  @Column({ type: 'boolean', default: false })
  is_super_admin: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // @OneToOne(() => User, (user) => user.adminProfile)
  // @JoinColumn({ name: 'user_id' })
  // user: User;

   @OneToOne(() => User, (user) => user.adminProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;


}