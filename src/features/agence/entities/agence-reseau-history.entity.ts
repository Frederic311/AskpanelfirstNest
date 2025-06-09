import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Agence } from './agence.entity';
import { Reseau } from '../../reseau/entities/reseau.entity';

@Entity()
export class AgenceReseauHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Agence, agence => agence.reseauxHistory)
  @JoinColumn({ name: 'agenceId' })
  agence: Agence;

  @ManyToOne(() => Reseau, reseau => reseau.agencesHistory)
  @JoinColumn({ name: 'reseauId' })
  reseau: Reseau;

  @Column({ type: 'timestamp' })
  dateDebut: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateFin: Date | null;
}