import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ReseauService } from './reseau.service';
import { CreateReseauDto } from './dto/create-reseau.dto';
import { UpdateReseauDto } from './dto/update-reseau.dto';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('reseau')
@Controller('reseau')
export class ReseauController {
  constructor(private readonly reseauService: ReseauService) {}

  @Post()
  create(@Body() createReseauDto: CreateReseauDto) {
    return this.reseauService.create(createReseauDto);
  }

  @Get()
  findAll() {
    return this.reseauService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reseauService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReseauDto: UpdateReseauDto) {
    return this.reseauService.update(+id, updateReseauDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reseauService.remove(+id);
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
    return this.reseauService.uploadExcel(file.buffer);
  }
}
