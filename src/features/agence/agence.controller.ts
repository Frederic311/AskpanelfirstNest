import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AgenceService } from './agence.service';
import { CreateAgenceDto } from './dto/create-agence.dto';
import { UpdateAgenceDto } from './dto/update-agence.dto';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('agence')
@Controller('agence')
export class AgenceController {
  constructor(private readonly agenceService: AgenceService) {}

  @Post()
  create(@Body() createAgenceDto: CreateAgenceDto) {
    return this.agenceService.create(createAgenceDto);
  }

  @Get()
  findAll() {
    return this.agenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agenceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgenceDto: UpdateAgenceDto) {
    return this.agenceService.update(+id, updateAgenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agenceService.remove(+id);
  }

  @Post('upload-excel')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ successRows: any[]; errorRows: any[] }> {
    return this.agenceService.uploadExcel(file.buffer);
  }
}
