import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateAgenceHistoryDto {
  @IsInt()
  agenceId: number;

  @IsInt()
  reseauId: number;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;
}