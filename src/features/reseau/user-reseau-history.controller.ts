import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { UserReseauHistoryService } from './user-reseau-history.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserReseauHistoryDto } from './dto/create-user-reseau-history.dto';

@ApiBearerAuth()
@ApiTags('user-reseau-history')
@Controller('user-reseau-history')
export class UserReseauHistoryController {
  constructor(private readonly historyService: UserReseauHistoryService) {}

  @Post()
  addUserToReseau(@Body() dto: CreateUserReseauHistoryDto) {
    return this.historyService.addUserToReseauByDto(dto);
  }

  @Get('current/:userId')
  getCurrentReseau(@Param('userId') userId: string) {
    return this.historyService.getCurrentReseauForUser(+userId);
  }

  @Get('at-date/:userId')
  getReseauAtDate(
    @Param('userId') userId: string,
    @Query('date') date: string,
  ) {
    return this.historyService.getReseauForUserAtDate(+userId, new Date(date));
  }

  @Get('between-dates/:userId')
  getReseauBetweenDates(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.historyService.getReseauForUserBetweenDates(
      +userId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
