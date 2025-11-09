import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  
  @Entity('batches')
  export class Batch {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    name: string; // e.g., "2021-2025"
  
    @Column({ type: 'int' })
    year_start: number; // e.g., 2021
  
    @Column({ type: 'int' })
    year_end: number; // e.g., 2025
  
    @Column({ type: 'boolean', default: true })
    is_active: boolean;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  
    // Relations will be added later
  }