import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgenceReseauHistory } from '../entities/agence-reseau-history.entity';
import { Agence } from '../entities/agence.entity';
import { Reseau } from '../../reseau/entities/reseau.entity';
import { CreateAgenceHistoryDto } from '../dto/create-agence-history';

@Injectable()
export class AgenceReseauHistoryService {
  constructor(
    @InjectRepository(AgenceReseauHistory)
    private readonly historyRepository: Repository<AgenceReseauHistory>,
    @InjectRepository(Agence)
    private readonly agenceRepository: Repository<Agence>,
    @InjectRepository(Reseau)
    private readonly reseauRepository: Repository<Reseau>,
  ) {}

  async addAgenceToReseau(
    agence: Agence,
    reseau: Reseau,
    dateDebut: Date = new Date(),
  ): Promise<AgenceReseauHistory> {
    // Optionally, close previous history
    await this.historyRepository.update(
      { agence, dateFin: null },
      { dateFin: dateDebut },
    );
    const history = this.historyRepository.create({
      agence,
      reseau,
      dateDebut,
      dateFin: null,
    });
    return this.historyRepository.save(history);
  }

  async addAgenceToReseauById(
    agenceId: number,
    reseauId: number,
    dateDebut: Date = new Date(),
  ): Promise<AgenceReseauHistory> {
    const agence = await this.agenceRepository.findOneBy({ id: agenceId });
    const reseau = await this.reseauRepository.findOneBy({ id: reseauId });
    if (!agence || !reseau) throw new Error('Agence or Reseau not found');
    return this.addAgenceToReseau(agence, reseau, dateDebut);
  }

  async addAgenceToReseauByDto(
    dto: CreateAgenceHistoryDto,
  ): Promise<AgenceReseauHistory> {
    // Find the current active history for the agence
    const current = await this.historyRepository.findOne({
      where: { agence: { id: dto.agenceId }, dateFin: null },
      order: { dateDebut: 'DESC' },
    });

    // If there is a current, set its date_fin to now
    if (current) {
      current.dateFin = new Date();
      await this.historyRepository.save(current);
    }

    // Create the new history record
    const newHistory = this.historyRepository.create({
      agence: { id: dto.agenceId },
      reseau: { id: dto.reseauId },
      dateDebut: new Date(),
      dateFin: null,
    });
    return this.historyRepository.save(newHistory);
  }

  async getCurrentReseauForAgence(
    agenceId: number,
  ): Promise<AgenceReseauHistory | null> {
    return this.historyRepository.findOne({
      where: { agence: { id: agenceId }, dateFin: null },
      relations: ['reseau'],
    });
  }

  async getReseauForAgenceAtDate(
    agenceId: number,
    date: Date,
  ): Promise<AgenceReseauHistory | null> {
    return this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.reseau', 'reseau')
      .where('history.agenceId = :agenceId', { agenceId })
      .andWhere('history.dateDebut <= :date', { date })
      .andWhere('(history.dateFin IS NULL OR history.dateFin > :date)', { date })
      .getOne();
  }

  async getReseauForAgenceBetweenDates(
    agenceId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<AgenceReseauHistory[]> {
    return this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.reseau', 'reseau')
      .where('history.agenceId = :agenceId', { agenceId })
      .andWhere('(history.dateDebut < :endDate) AND (history.dateFin IS NULL OR history.dateFin > :startDate)', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async getAgencesInReseauBetweenDates(
    reseauId: number,
    startDate: Date,
    endDate: Date,
  ) {
    return this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.agence', 'agence')
      .where('history.reseauId = :reseauId', { reseauId })
      .andWhere(
        // Overlapping intervals: (date_debut <= endDate) AND (date_fin IS NULL OR date_fin >= startDate)
        '(history.date_debut <= :endDate) AND (history.date_fin IS NULL OR history.date_fin >= :startDate)',
        { startDate, endDate },
      )
      .getMany();
  }
}