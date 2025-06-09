import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { Support } from './entities/support.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportUploadService } from './support-upload.service';
import { MsGraphOAuth2Service } from './ms-graph-oauth2.service';
import { MsGraphExcelService } from './ms-graph-excel.service';
import { SupportCronService } from './support-cron/support-cron.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Support]), MailModule],

  controllers: [SupportController],
  providers: [
    SupportService,
    SupportUploadService,
    MsGraphOAuth2Service,
    MsGraphExcelService,
    SupportCronService,
  ],
})
export class SupportModule {}
