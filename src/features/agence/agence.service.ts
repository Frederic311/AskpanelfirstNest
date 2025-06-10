import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agence } from './entities/agence.entity';
import { CreateAgenceDto } from './dto/create-agence.dto';
import { UpdateAgenceDto } from './dto/update-agence.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AgenceService {
  constructor(
    @InjectRepository(Agence)
    private readonly agenceRepository: Repository<Agence>,
  ) {}

  async create(createAgenceDto: CreateAgenceDto): Promise<Agence> {
    const agence = this.agenceRepository.create(createAgenceDto);
    return this.agenceRepository.save(agence);
  }

  async findAll(): Promise<Agence[]> {
    return this.agenceRepository.find();
  }

  async findOne(id: number): Promise<Agence> {
    return this.agenceRepository.findOneBy({ id });
  }

  async findOneWithUsers(id: number) {
    return this.agenceRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async update(id: number, updateAgenceDto: UpdateAgenceDto): Promise<Agence> {
    await this.agenceRepository.update(id, updateAgenceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.agenceRepository.delete(id);
  }

  async uploadExcel(fileBuffer: Buffer): Promise<{ successRows: any[]; errorRows: any[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1).values as string[];
    const successRows = [];
    const errorRows = [];

    // Map Excel header to DTO property (add 'Reseau' -> 'nom' mapping)
    const headerMap: Record<string, string> = {
      'Agence': 'nom',
      'Reseau': 'nom',
      'nom': 'nom',
      // add more mappings if your Agence entity has more fields
    };

    const getDtoFromRow = (rowData: any) => {
      const dto: any = {};
      for (const key in rowData) {
        const mappedKey = headerMap[key];
        if (mappedKey) {
          dto[mappedKey] = rowData[key];
        }
      }
      return dto as CreateAgenceDto;
    };

    const promises = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const rowData: any = {};
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      values.forEach((value, idx) => {
        rowData[headerRow[idx + 1]] = value;
      });
      const dto = getDtoFromRow(rowData);
      promises.push(
        this.create(dto)
          .then(created => successRows.push(created))
          .catch(err => errorRows.push({ row: rowData, error: err.message }))
      );
    });

    await Promise.all(promises);

    return { successRows, errorRows };
  }
}