import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AgenceReseauHistory } from '../../agence/entities/agence-reseau-history.entity';
import { UserReseauHistory } from '../entities/user-reseau-history.entity';

@Entity()
export class Reseau {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Ensure unique name
  nom: string;

  @OneToMany(() => AgenceReseauHistory, history => history.reseau)
  agencesHistory: AgenceReseauHistory[];

  @OneToMany(() => UserReseauHistory, history => history.reseau)
  usersHistory: UserReseauHistory[];
}