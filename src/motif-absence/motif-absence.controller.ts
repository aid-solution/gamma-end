import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EchellonDTO } from 'src/dto/echellon.dto';
import { MotifAbsenceService } from './motif-absence.service';

@Controller('motif-absence')
export class MotifAbsenceController {
  constructor(private readonly motifAbsenceService: MotifAbsenceService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() echellonDto: EchellonDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...motif } = echellonDto;
    try {
      return await this.motifAbsenceService.create(motif);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.motifAbsenceService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.motifAbsenceService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.motifAbsenceService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateTypeAbsence(@Body() echellonDto: EchellonDTO) {
    const { _id, ...motif } = echellonDto;
    try {
      return await this.motifAbsenceService.update(_id, motif);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
