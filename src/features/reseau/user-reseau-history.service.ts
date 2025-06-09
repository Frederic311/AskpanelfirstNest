import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReseauHistory } from './entities/user-reseau-history.entity';
import { CreateUserReseauHistoryDto } from './dto/create-user-reseau-history.dto';

@Injectable()
export class UserReseauHistoryService {
  constructor(
    @InjectRepository(UserReseauHistory)
    private readonly historyRepository: Repository<UserReseauHistory>,
  ) {}

  async addUserToReseauByDto(dto: CreateUserReseauHistoryDto): Promise<UserReseauHistory> {
    // Close previous history
    const current = await this.historyRepository.findOne({
      where: { user: { id: dto.userId }, dateFin: null },
      order: { dateDebut: 'DESC' },
    });
    if (current) {
      current.dateFin = new Date();
      await this.historyRepository.save(current);
    }
    const newHistory = this.historyRepository.create({
      user: { id: dto.userId },
      reseau: { id: dto.reseauId },
      dateDebut: dto.dateDebut ? dto.dateDebut : new Date(),
      dateFin: null,
    });
    return this.historyRepository.save(newHistory);
  }

  async getCurrentReseauForUser(userId: number): Promise<UserReseauHistory | null> {
    return this.historyRepository.findOne({
      where: { user: { id: userId }, dateFin: null },
      relations: ['reseau'],
    });
  }

  async getReseauForUserAtDate(userId: number, date: Date): Promise<UserReseauHistory | null> {
    return this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.reseau', 'reseau')
      .where('history.userId = :userId', { userId })
      .andWhere('history.dateDebut <= :date', { date })
      .andWhere('(history.dateFin IS NULL OR history.dateFin > :date)', { date })
      .getOne();
  }

  async getReseauForUserBetweenDates(userId: number, startDate: Date, endDate: Date): Promise<UserReseauHistory[]> {
    return this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.reseau', 'reseau')
      .where('history.userId = :userId', { userId })
      .andWhere('(history.dateDebut < :endDate) AND (history.dateFin IS NULL OR history.dateFin > :startDate)', {
        startDate,
        endDate,
      })
      .getMany();
  }
}
