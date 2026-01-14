// ============================================
// FILE: entities/role.entity.ts (UPDATED)
// ============================================

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
import { User } from './user.entity';
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // 'SuperAdmin' | 'Admin' | 'Faculty' | 'Student'

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}