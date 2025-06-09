import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Statut } from '../../../core/enums/statut.enum';
import { Canal } from '../../../core/enums/canal.enum';

@Entity()
export class Support {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  utilisateur: string;

  @Column()
  fonction: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  descriptif: string;

  @Column()
  appliConcerne: string;

  @Column()
  actionsMenees: string;

  @Column({ type: 'time' })
  heureDebut: string;

  @Column({ type: 'time' })
  heureFin: string;

  @Column({ type: 'enum', enum: Canal })
  canal: Canal;

  @Column({ type: 'enum', enum: Statut })
  statut: Statut;
}
