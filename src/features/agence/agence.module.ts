import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agence } from './entities/agence.entity';
import { AgenceReseauHistory } from './entities/agence-reseau-history.entity';
import { AgenceService } from './agence.service';
import { AgenceController } from './agence.controller';
import { AgenceReseauHistoryService } from './agence-reseau-history/agence-reseau-history.service';
import { AgenceReseauHistoryController } from './agence-reseau-history/agence-reseau-history.controller';
import { ReseauModule } from '../reseau/reseau.module';

@Module({
  imports: [TypeOrmModule.forFeature([Agence, AgenceReseauHistory]),ReseauModule],
  controllers: [AgenceController, AgenceReseauHistoryController],
  providers: [AgenceService, AgenceReseauHistoryService],
  exports: [TypeOrmModule],
})
export class AgenceModule {}