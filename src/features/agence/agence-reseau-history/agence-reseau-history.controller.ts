import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { AgenceReseauHistoryService } from './agence-reseau-history.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAgenceHistoryDto } from '../dto/create-agence-history';

@ApiBearerAuth()
@ApiTags('agence-reseau-history')
@Controller('agence-reseau-history')
export class AgenceReseauHistoryController {
  constructor(private readonly historyService: AgenceReseauHistoryService) {}

  @Post()
  addAgenceToReseau(@Body() dto: CreateAgenceHistoryDto) {
    return this.historyService.addAgenceToReseauByDto(dto);
  }

  @Get('current/:agenceId')
  getCurrentReseau(@Param('agenceId') agenceId: string) {
    return this.historyService.getCurrentReseauForAgence(+agenceId);
  }

  @Get('at-date/:agenceId')
  getReseauAtDate(
    @Param('agenceId') agenceId: string,
    @Query('date') date: string,
  ) {
    return this.historyService.getReseauForAgenceAtDate(+agenceId, new Date(date));
  }

  @Get('between-dates/:agenceId')
  getReseauBetweenDates(
    @Param('agenceId') agenceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.historyService.getReseauForAgenceBetweenDates(
      +agenceId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('agences-in-reseau/:reseauId')
  getAgencesInReseauBetweenDates(
    @Param('reseauId') reseauId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.historyService.getAgencesInReseauBetweenDates(
      +reseauId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}