import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { CLO } from './clo.entity';
  import { PLO } from './plo.entity';
  
  @Entity('clo_plo_mappings')
  export class CLOPLOMapping {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int' })
    clo_id: number;
  
    @Column({ type: 'int' })
    plo_id: number;
  
    @Column({ type: 'int', default: 2 })
    weightage: number; // 1=Low, 2=Medium, 3=High
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  
    @ManyToOne(() => CLO)
    @JoinColumn({ name: 'clo_id' })
    clo: CLO;
  
    @ManyToOne(() => PLO)
    @JoinColumn({ name: 'plo_id' })
    plo: PLO;
  }