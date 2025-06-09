import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { MsGraphOAuth2Service } from './ms-graph-oauth2.service';
import { SupportUploadService } from './support-upload.service';
import { MailService } from '../mail/mail.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class MsGraphExcelService {
  private readonly logger = new Logger(MsGraphExcelService.name);

  constructor(
    private readonly msGraphOAuth2Service: MsGraphOAuth2Service,
    private readonly supportUploadService: SupportUploadService,
    private readonly mailService: MailService, // Inject MailService
  ) {}

  async fetchAndProcessExcel(fileId: string, worksheetName: string) {
    const notifyEmail = process.env.ADMIN_EMAIL;
    try {
      const accessToken = await this.msGraphOAuth2Service.getAccessToken();
      const userId = process.env['microsoft.graph.user-id'];
      const url = `https://graph.microsoft.com/v1.0/users/${userId}/drive/items/${fileId}/workbook/worksheets('${worksheetName}')/usedRange`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 200 && response.data.values) {
        const rows = response.data.values;
        if (rows.length < 2) {
          this.logger.warn('No data rows found in the response.');
          await this.mailService.sendExcelProcessFailure(
            notifyEmail,
            'No data rows found in the response.',
          );
          return;
        }
        const buffer = await this.rowsToExcelBuffer(rows);
        const result =
          await this.supportUploadService.saveSupportEntitiesFromExcel(buffer);
        if (result && result.errorRows && result.errorRows.length > 0) {
          const pdfBuffer = await this.generateErrorPdf(result.errorRows);
          await this.mailService.sendExcelProcessFailure(
            notifyEmail,
            `Some rows failed to import. See attached PDF for details.`,
            pdfBuffer,
          );
        } else {
          await this.mailService.sendExcelProcessSuccess(notifyEmail);
        }
      } else {
        this.logger.error('Failed to fetch the range data.');
        await this.mailService.sendExcelProcessFailure(
          notifyEmail,
          'Failed to fetch the range data.',
        );
      }
    } catch (e) {
      this.logger.error('Error in fetchAndProcessExcel: ' + e.message);
      await this.mailService.sendExcelProcessFailure(
        notifyEmail,
        e.message || 'Unknown error',
      );
    }
  }

  private async rowsToExcelBuffer(rows: any[][]): Promise<Buffer> {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    rows.forEach((row: any[]) => worksheet.addRow(row));
    return workbook.xlsx.writeBuffer();
  }

  private async generateErrorPdf(errorRows: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    let y = height - 40;
    page.drawText('Excel Import Errors', {
      x: 50,
      y,
      size: 18,
      font,
      color: rgb(0, 0, 0.8),
    });
    y -= 30;

    errorRows.forEach((err: any) => {
      if (y < 40) {
        y = height - 40;
        pdfDoc.addPage();
      }
      page.drawText(`Row ${err.row}: ${err.error}`, {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 18;
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
