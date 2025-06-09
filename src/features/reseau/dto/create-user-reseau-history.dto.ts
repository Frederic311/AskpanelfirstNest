import { IsInt, IsOptional } from 'class-validator';

export class CreateUserReseauHistoryDto {
  @IsInt()
  userId: number;

  @IsInt()
  reseauId: number;

  @IsOptional()
  dateDebut?: Date;
}
