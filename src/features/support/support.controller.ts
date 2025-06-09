import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { Support } from './entities/support.entity';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportUploadService } from './support-upload.service';
import { MsGraphExcelService } from './ms-graph-excel.service';

@ApiBearerAuth()
@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly supportUploadService: SupportUploadService,
    private readonly msGraphExcelService: MsGraphExcelService,
  ) {}

  @Post()
  async create(@Body() createSupportDto: CreateSupportDto): Promise<Support> {
    return this.supportService.create(createSupportDto);
  }

  @Get()
  async findAll(): Promise<Support[]> {
    return this.supportService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Support> {
    return this.supportService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupportDto: UpdateSupportDto,
  ): Promise<Support> {
    return this.supportService.update(+id, updateSupportDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.supportService.remove(+id);
  }

  @Post('upload')
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
    return this.supportUploadService.saveSupportEntitiesFromExcel(file.buffer);
  }

  @Post('fetch-ms-excel')
  async fetchMsExcel() {
    const fileId = '01U3WPLN33BZCWK4AOCFBJYEL5GDEVUL23'; // or from config
    const worksheetName = 'Sheet1';
    await this.msGraphExcelService.fetchAndProcessExcel(fileId, worksheetName);
    return { status: 'ok' };
  }
}
