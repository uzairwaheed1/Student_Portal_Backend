import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Program } from '../../program/entities/program.entity';

@Entity('plos')
export class Plo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string; // PLO-1

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  program_id: number;

  @ManyToOne(() => Program, program => program.plos, { nullable: false })
  @JoinColumn({ name: 'program_id' })
  program: Program;
}
