import { Injectable } from '@nestjs/common';
import { CreateReseauDto } from './dto/create-reseau.dto';
import { UpdateReseauDto } from './dto/update-reseau.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reseau } from './entities/reseau.entity';
import * as ExcelJS from 'exceljs';


@Injectable()
export class ReseauService {
 constructor(
    @InjectRepository(Reseau)
    private readonly reseauRepository: Repository<Reseau>,
  ) {}

  async create(CreateReseauDto: CreateReseauDto): Promise<Reseau> {
    const agence = this.reseauRepository.create(CreateReseauDto);
    return this.reseauRepository.save(agence);
  }

  async findAll(): Promise<Reseau[]> {
    return this.reseauRepository.find();
  }

  async findOne(id: number): Promise<Reseau & { agencesHistory: any[] }> {
    // Get the reseau with only current agences (dateFin is null)
    const reseau = await this.reseauRepository.findOne({
      where: { id },
      relations: [
        'agencesHistory',
        'agencesHistory.agence',
      ],
    });

    if (!reseau) return null;

    // Filter agencesHistory to only those with dateFin === null
    const currentAgencesHistory = (reseau.agencesHistory || []).filter(
      (history: any) => history.dateFin === null
    );

    // Return reseau with only current agencesHistory
    return {
      ...reseau,
      agencesHistory: currentAgencesHistory,
    };
  }

  async update(id: number, updateAgenceDto: UpdateReseauDto): Promise<Reseau> {
    await this.reseauRepository.update(id, updateAgenceDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.reseauRepository.delete(id);
  }

  async uploadExcel(fileBuffer: Buffer): Promise<{ successRows: any[]; errorRows: any[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1).values as string[];
    const successRows = [];
    const errorRows = [];

    // Map Excel header to DTO property
    const headerMap: Record<string, string> = {
      'Reseau': 'nom',
      'nom': 'nom',
      // add more mappings if needed
    };

    const getDtoFromRow = (rowData: any) => {
      const dto: any = {};
      for (const key in rowData) {
        const mappedKey = headerMap[key];
        if (mappedKey) {
          dto[mappedKey] = rowData[key];
        }
      }
      return dto as CreateReseauDto;
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
