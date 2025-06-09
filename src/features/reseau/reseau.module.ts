import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reseau } from './entities/reseau.entity';
import { AgenceReseauHistory } from '../agence/entities/agence-reseau-history.entity';
import { ReseauService } from './reseau.service';
import { ReseauController } from './reseau.controller';
import { UserReseauHistory } from './entities/user-reseau-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reseau, AgenceReseauHistory,UserReseauHistory])],
  controllers: [ReseauController],
  providers: [ReseauService],
  exports: [TypeOrmModule],
})
export class ReseauModule {}