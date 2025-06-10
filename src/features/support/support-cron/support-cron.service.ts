import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MsGraphExcelService } from '../ms-graph-excel.service';

@Injectable()
export class SupportCronService {
  constructor(private readonly msGraphExcelService: MsGraphExcelService) {}

  @Cron('*/30 * * * *')
  async handleCron() {
    const fileId = process.env.EXCEL_FILE_ID;
    const worksheetName = process.env.EXCEL_WORKSHEET_NAME;
    await this.msGraphExcelService.fetchAndProcessExcel(fileId, worksheetName);
  }
}