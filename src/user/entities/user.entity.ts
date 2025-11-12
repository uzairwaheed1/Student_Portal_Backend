import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from 'src/entities/role.entity';

// ============================================
// USER ENTITY
// ============================================
@Entity('users')
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'int' })
  role_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

//   @OneToMany(() => FacultyProfile, (profile) => profile.user)
//   facultyProfile: FacultyProfile[];

//   @OneToMany(() => AdminProfile, (profile) => profile.user)
//   adminProfile: AdminProfile[];

//   @OneToMany(() => StudentProfile, (profile) => profile.user)
//   studentProfile: StudentProfile[];

//   @OneToMany(() => ActivityLog, (log) => log.user)
//   activityLogs: ActivityLog[];

//   @OneToMany(() => Notification, (notification) => notification.user)
//   notifications: Notification[];

//   @OneToMany(() => FileUpload, (file) => file.uploadedBy)
//   fileUploads: FileUpload[];
}