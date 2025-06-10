import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from './entities/support.entity';
import * as ExcelJS from 'exceljs';
import { Canal } from 'src/core/enums/canal.enum';
import { Statut } from 'src/core/enums/statut.enum';
import * as crypto from 'crypto';

@Injectable()
export class SupportUploadService {
  private readonly logger = new Logger(SupportUploadService.name);

  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,
  ) { }

  // Utility to hash Excel-originating fields for change detection
  private hashExcelFields(support: Partial<Support>): string {
    const data = [
      support.utilisateur,
      support.fonction,
      support.reseau,
      support.agence,
      support.date,
      support.descriptif,
      support.appliConcerne,
      support.actionsMenees,
      support.heureDebut,
      support.heureFin,
      support.canal,
      support.statut,
    ].join('|');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async saveSupportEntitiesFromExcel(buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    const headers = sheet.getRow(1).values as string[];
    const validHeaders = [
      'excelUniqueId', // Make sure your Excel file has this column!
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

    // Collect all excelUniqueIds from this import
    const excelIds = new Set<string>();

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      try {
        const support = new Support();
        let excelUniqueId: string | undefined = undefined;
        for (let j = 1; j < headers.length; j++) {
          const header = headers[j];
          const value = row.getCell(j).value;
          switch (header) {
            case 'excelUniqueId':
              excelUniqueId = value ? String(value) : undefined;
              break;
            case 'date':
              if (value instanceof Date) {
                support.date = value.toISOString().slice(0, 10);
              } else if (typeof value === 'number') {
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                const dateObj = new Date(
                  excelEpoch.getTime() + value * 24 * 60 * 60 * 1000,
                );
                support.date = dateObj.toISOString().slice(0, 10);
              } else if (typeof value === 'string') {
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
                const totalSeconds = Math.round(value * 24 * 60 * 60);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                timeValue = [hours, minutes, seconds]
                  .map((n) => n.toString().padStart(2, '0'))
                  .join(':');
              } else if (value instanceof Date) {
                const hours = value.getHours();
                const minutes = value.getMinutes();
                const seconds = value.getSeconds();
                timeValue = [hours, minutes, seconds]
                  .map((n) => n.toString().padStart(2, '0'))
                  .join(':');
              } else if (typeof value === 'string') {
                const trimmed = value.trim();
                if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
                  const [h, m] = trimmed.split(':');
                  timeValue = h.padStart(2, '0') + ':' + m + ':00';
                } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
                  const [h, m, s] = trimmed.split(':');
                  timeValue = h.padStart(2, '0') + ':' + m + ':' + s;
                } else if (trimmed === '') {
                  timeValue = null;
                } else {
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

        // --- Excel/manual sync logic ---
        if (!excelUniqueId) {
          errorRows.push({ row: i, error: 'Missing excelUniqueId' });
          continue;
        }
        excelIds.add(excelUniqueId);

        // Compute hash for Excel fields
        const excelHash = this.hashExcelFields(support);

        // Try to find existing record by excelUniqueId
        const existing = await this.supportRepository.findOne({
          where: { excelUniqueId },
        });

        if (existing) {
          if (!existing.isManuallyModified && existing.excelDataHash !== excelHash) {
            // Update from Excel
            Object.assign(existing, support, {
              excelDataHash: excelHash,
              lastSyncedFromExcelAt: new Date(),
              isActiveInExcel: true,
            });
            await this.supportRepository.save(existing);
            successRows.push(existing);
          } else {
            // Only update sync time and active flag
            existing.lastSyncedFromExcelAt = new Date();
            existing.isActiveInExcel = true;
            await this.supportRepository.save(existing);
            successRows.push(existing);
          }
        } else {
          // New record from Excel
          const newSupport = this.supportRepository.create({
            ...support,
            excelUniqueId,
            excelDataHash: excelHash,
            lastSyncedFromExcelAt: new Date(),
            isActiveInExcel: true,
            isManuallyAdded: false,
            isManuallyModified: false,
          });
          await this.supportRepository.save(newSupport);
          successRows.push(newSupport);
        }
      } catch (e) {
        errorRows.push({ row: i, error: e.message });
      }
    }

    // Soft-delete supports missing from Excel
    if (excelIds.size > 0) {
      await this.supportRepository
        .createQueryBuilder()
        .update()
        .set({ isActiveInExcel: false })
        .where('isActiveInExcel = :active', { active: true })
        .andWhere('isManuallyModified = :mod', { mod: false })
        .andWhere('isManuallyAdded = :added', { added: false })
        .andWhere('excelUniqueId NOT IN (:...ids)', { ids: Array.from(excelIds) })
        .execute();
    }

    return { successRows, errorRows };
  }
}