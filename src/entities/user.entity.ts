// / ============================================
// FILE: entities/user.entity.ts (UPDATED)
// ============================================
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { AdminProfile } from './admin-profile.entity';
import { FacultyProfile } from '../admin/entities/faculty-profile.entity';

@Entity('users')
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string | null;

  @Column({ type: 'int' })
  role_id: number;

  // NEW AUTH-RELATED COLUMNS
  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending'
  })
  account_status: string; // 'pending' | 'active' | 'suspended'

  @Column({ type: 'varchar', length: 255, nullable: true })
  invitation_token: string;

  @Column({ type: 'timestamp', nullable: true })
  invitation_expires_at: Date;

  @Column({ type: 'int', nullable: true })
  invited_by: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  //   @OneToOne(() => AdminProfile, (profile) => profile.user)
  // adminProfile: AdminProfile;  // Single object, not array

   @OneToOne(() => AdminProfile, (profile) => profile.user)
  adminProfile: AdminProfile;

  @OneToOne(() => FacultyProfile, (profile) => profile.user)
  facultyProfile: FacultyProfile;
}
