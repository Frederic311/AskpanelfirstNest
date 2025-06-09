import { Controller, Get, Body, Patch, Param, Delete, Post, ParseIntPipe } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Roles } from '../../core/decorators/role.decorator';
import { Role } from '../../core/enums/role.enum';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  async findAll(): Promise<UserDto[]> {
    return (await this.usersService.findAll()).map((u) => UserDto.fromUser(u));
  }

  @Get('me')
  async me(@CurrentUser() user) {
    return UserDto.fromUser(await this.usersService.findOneByEmail(user.email));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return UserDto.fromUser(await this.usersService.findOne(+id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserDto) {
    return this.usersService.remove(+id, user);
  }

  @Post(':id/assign-agence/:agenceId')
  async assignAgence(
    @Param('id', ParseIntPipe) id: number,
    @Param('agenceId', ParseIntPipe) agenceId: number,
  ) {
    return this.usersService.assignAgence(id, agenceId);
  }
}
