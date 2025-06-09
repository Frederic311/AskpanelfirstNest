import { Role } from '../../../core/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Agence } from '../../agence/entities/agence.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  email: string;

  @Column()
  fonction: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({
    type: 'simple-array',
  })
  roles: Role[];

  @Exclude()
  @Column()
  token: string;

  @Exclude()
  @Column({ type: 'timestamp' })
  tokenExpires?: Date;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt?: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt?: Date;

  @Exclude()
  @DeleteDateColumn()
  public deletedAt?: Date;

  @ManyToOne(() => Agence, { nullable: true })
  @JoinColumn({ name: 'agenceId' })
  agence?: Agence;

  get fullName() {
    return `${this.firstname} ${this.lastname}`;
  }
}
