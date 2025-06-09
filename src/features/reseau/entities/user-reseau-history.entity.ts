import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reseau } from './reseau.entity';

@Entity()
export class UserReseauHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @ManyToOne(() => Reseau, reseau => reseau.id)
  reseau: Reseau;

  @Column({ type: 'timestamp' })
  dateDebut: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateFin: Date | null;
}
