import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from './entities/support.entity';
import * as ExcelJS from 'exceljs';
import { Canal } from 'src/core/enums/canal.enum';
import { Statut } from 'src/core/enums/statut.enum';

@Injectable()
export class SupportUploadService {
  private readonly logger = new Logger(SupportUploadService.name);

  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
  ) { }

  async saveSupportEntitiesFromExcel(buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    const headers = sheet.getRow(1).values as string[];
    const validHeaders = [
      'date',
      'reseau',
      'agence',
      'utilisateur',
      'fonction',
      'descriptif',
      'appliConcerne',
      'actionsMenees',
      'heureDebut',
      'heureFin',
      'canal',
      'statut',
    ];
    const successRows: Support[] = [];
    const errorRows: any[] = [];

    // Validate headers
    for (let i = 1; i < headers.length; i++) {
      if (!validHeaders.includes(headers[i])) {
        errorRows.push({
          row: 1,
          error: `Column "${headers[i]}" does not correspond to any column in the database`,
        });
      }
    }
    if (errorRows.length) return { successRows, errorRows };

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      try {
        const support = new Support();
        for (let j = 1; j < headers.length; j++) {
          const header = headers[j];
          const value = row.getCell(j).value;
          switch (header) {
            case 'date':
              // Convert Excel date to YYYY-MM-DD
              if (value instanceof Date) {
                support.date = value.toISOString().slice(0, 10);
              } else if (typeof value === 'number') {
                // Excel stores dates as numbers (days since 1900-01-01)
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                const dateObj = new Date(
                  excelEpoch.getTime() + value * 24 * 60 * 60 * 1000,
                );
                support.date = dateObj.toISOString().slice(0, 10);
              } else if (typeof value === 'string') {
                // Try to parse string date
                const parsed = new Date(value);
                if (!isNaN(parsed.getTime())) {
                  support.date = parsed.toISOString().slice(0, 10);
                } else {
                  support.date = '';
                }
              } else {
                support.date = '';
              }
              break;
            case 'reseau':
              support.reseau = value ? String(value) : '';
              break;
            case 'agence':
              support.agence = value ? String(value) : '';
              break;
            case 'heureDebut':
            case 'heureFin':
              let timeValue: string | null = null;
              if (value === null || value === undefined || value === '') {
                timeValue = null;
              } else if (typeof value === 'number') {
                // Excel time as fraction of day (e.g. 0.5 = 12:00:00)
                const totalSeconds = Math.round(value * 24 * 60 * 60);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                timeValue = [hours, minutes, seconds]
                  .map((n) => n.toString().padStart(2, '0'))
                  .join(':');
              } else if (value instanceof Date) {
                // If ExcelJS returns a Date object (should be rare for time-only cells)
                const hours = value.getHours();
                const minutes = value.getMinutes();
                const seconds = value.getSeconds();
                timeValue = [hours, minutes, seconds]
                  .map((n) => n.toString().padStart(2, '0'))
                  .join(':');
              } else if (typeof value === 'string') {
                // Accept HH:mm, HH:mm:ss, or H:mm, H:mm:ss (with or without leading zero)
                const trimmed = value.trim();
                if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
                  // e.g. 9:30 or 09:30
                  const [h, m] = trimmed.split(':');
                  timeValue = h.padStart(2, '0') + ':' + m + ':00';
                } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
                  // e.g. 9:30:00 or 09:30:00
                  const [h, m, s] = trimmed.split(':');
                  timeValue = h.padStart(2, '0') + ':' + m + ':' + s;
                } else if (trimmed === '') {
                  timeValue = null;
                } else {
                  // Invalid string format
                  timeValue = null;
                }
              } else {
                timeValue = null;
              }
              if (header === 'heureDebut') support.heureDebut = timeValue;
              else support.heureFin = timeValue;
              break;
            case 'utilisateur':
              support.utilisateur = value ? String(value) : '';
              break;
            case 'fonction':
              support.fonction = value ? String(value) : '';
              break;
            case 'descriptif':
              support.descriptif = value ? String(value) : '';
              break;
            case 'appliConcerne':
              support.appliConcerne = value ? String(value) : '';
              break;
            case 'actionsMenees':
              support.actionsMenees = value ? String(value) : '';
              break;
            case 'canal':
              support.canal =
                Canal[(value ? String(value) : '') as keyof typeof Canal];
              break;
            case 'statut':
              support.statut =
                Statut[(value ? String(value) : '') as keyof typeof Statut];
              break;
          }
        }
        // If heureDebut or heureFin is required (NOT NULL), skip row if missing
        if (support.heureDebut == null || support.heureFin == null) {
          errorRows.push({
            row: i,
            error: 'heureDebut or heureFin is required and missing or invalid',
          });
          continue;
        }
        successRows.push(support);
      } catch (e) {
        errorRows.push({ row: i, error: e.message });
      }
    }
    await this.supportRepository.save(successRows);
    return { successRows, errorRows };
  }
}