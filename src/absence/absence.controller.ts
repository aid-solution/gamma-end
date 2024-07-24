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

@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async createAbsence(@Body() absenceDto: AbsenceDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = absenceDto;
    const createAbsenceDto = rest as unknown as CreateAbsenceDTO;
    try {
      return await this.absenceService.create(createAbsenceDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.absenceService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.absenceService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get('/agent/:agent')
  async findAllByAgent(@Param('agent') agent: string) {
    try {
      return await this.absenceService.filterByAgent(agent);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
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
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
