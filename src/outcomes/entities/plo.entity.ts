import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('plos')
  export class PLO {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    code: string; // e.g., "PLO-1"
  
    @Column({ type: 'text' })
    description: string;
  
    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string; // e.g., "Knowledge", "Skills", "Attitude"
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
  }