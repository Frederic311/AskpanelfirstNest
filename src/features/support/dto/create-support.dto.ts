import { Canal } from '../../../core/enums/canal.enum';
import { Statut } from '../../../core/enums/statut.enum';
import { IsString, IsDateString, IsEnum } from 'class-validator';

export class CreateSupportDto {
  @IsString()
  utilisateur: string;

  @IsString()
  fonction: string;

  @IsDateString()
  date: string; // ISO date string, e.g. '2024-06-06'

  @IsString()
  descriptif: string;

  @IsString()
  appliConcerne: string;

  @IsString()
  actionsMenees: string;

  @IsString()
  heureDebut: string; // e.g. '09:00:00'

  @IsString()
  heureFin: string; // e.g. '10:00:00'

  @IsEnum(Canal)
  canal: Canal;

  @IsEnum(Statut)
  statut: Statut;
}
