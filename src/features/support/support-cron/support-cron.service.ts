import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MsGraphExcelService } from '../ms-graph-excel.service';

@Injectable()
export class SupportCronService {
  constructor(private readonly msGraphExcelService: MsGraphExcelService) {}

  @Cron('*/30 * * * *')
  async handleCron() {
    const fileId = '01U3WPLN33BZCWK4AOCFBJYEL5GDEVUL23';
    const worksheetName = 'Sheet1';
    await this.msGraphExcelService.fetchAndProcessExcel(fileId, worksheetName);
  }
}
