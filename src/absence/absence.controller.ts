import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceDTO } from 'src/dto/absence.dto';
import { CreateAbsenceDTO } from 'src/dto/createAbsence.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';
import { UpdateAbsenceDTO } from 'src/dto/updateAbsence.dto';
import { differenceBetweenDates } from 'src/utilities/formatDate';

@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async createAbsence(@Body() absenceDto: AbsenceDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = absenceDto;
    const annee = +absenceDto.dateDebut.split('-')[0];
    const startYear = new Date(Date.UTC(annee, 0, 1, 0, 0, 0));
    const endYear = new Date(Date.UTC(annee, 11, 31, 0, 0, 0));
    const findAllAbsence =
      await this.absenceService.findAllAbsencesExptionnelle(
        absenceDto.agent,
        startYear,
        endYear,
      );
    let totalJours: number = 0;
    for (const absence of findAllAbsence) {
      if (absenceDto.type === absence.type) {
        totalJours += differenceBetweenDates(
          absence.dateDebut,
          absence.dateFin,
        );
      }
    }
    const jours =
      totalJours +
      differenceBetweenDates(
        new Date(absenceDto.dateDebut),
        new Date(absenceDto.dateFin),
      );
    if (absenceDto.type === 'Exceptionnelle' && jours > 10) {
      throw new InternalServerErrorException('exceeding_number_days');
    }
    const createAbsenceDto = rest as unknown as CreateAbsenceDTO;
    try {
      return await this.absenceService.create(createAbsenceDto);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.absenceService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.absenceService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/agent/:agent')
  async findAllByAgent(@Param('agent') agent: string) {
    try {
      return await this.absenceService.filterByAgent(agent);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  @UsePipes(ConvertToOriginalTypePipe)
  async updateAbsence(@Body() updateAbsenceDto: AbsenceDTO) {
    try {
      return await this.absenceService.update(
        updateAbsenceDto as unknown as UpdateAbsenceDTO,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
