import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from './entities/support.entity';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
  ) {}

  async create(createSupportDto: CreateSupportDto): Promise<Support> {
    const support = this.supportRepository.create(createSupportDto);
    // If created manually, set isManuallyAdded to true
    support.isManuallyAdded = true;
    support.isActiveInExcel = false;
    support.isManuallyModified = false;
    support.lastManualUpdateAt = new Date();
    // Optionally set manuallyUpdatedBy if you have user info
    return this.supportRepository.save(support);
  }

  async findAll(): Promise<Support[]> {
    return this.supportRepository.find();
  }

  async findOne(id: number): Promise<Support> {
    const support = await this.supportRepository.findOne({ where: { id } });
    if (!support) {
      throw new NotFoundException('Support not found');
    }
    return support;
  }

  async update(
    id: number,
    updateSupportDto: UpdateSupportDto,
    userId?: string, // Optionally pass user id/email for audit
  ): Promise<Support> {
    const support = await this.supportRepository.findOne({ where: { id } });
    if (!support) {
      throw new NotFoundException('Support not found');
    }
    Object.assign(support, updateSupportDto);
    // Mark as manually modified
    support.isManuallyModified = true;
    support.lastManualUpdateAt = new Date();
    if (userId) {
      support.manuallyUpdatedBy = userId;
    }
    return this.supportRepository.save(support);
  }

  async remove(id: number): Promise<void> {
    const result = await this.supportRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Support not found');
    }
  }
}