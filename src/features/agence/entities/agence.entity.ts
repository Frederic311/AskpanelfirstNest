import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AgenceReseauHistory } from './agence-reseau-history.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Agence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Ensure unique name
  nom: string;

  @OneToMany(() => AgenceReseauHistory, history => history.agence)
  reseauxHistory: AgenceReseauHistory[];

  @OneToMany(() => User, user => user.agence)
  users: User[];
}