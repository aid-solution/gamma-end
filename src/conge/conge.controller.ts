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
import { CongeService } from './conge.service';
import { CongeDTO } from 'src/dto/conge.dto';
import { CreateCongeDTO } from 'src/dto/createConge.dto';
import { differenceBetweenDates, formatDate } from 'src/utilities/formatDate';

@Controller('conge')
export class CongeController {
  constructor(private readonly congeService: CongeService) {}

  private listConges(conges: any[]) {
    const response: any[] = [];
    for (const conge of conges) {
      const dateFin = conge.dateFin ? formatDate(conge.dateFin) : 'à nos jours';
      response.push({
        matricule: conge.agent.matricule,
        nomPrenom: `${conge.agent.nom} ${conge.agent.prenom}`,
        periode: `${formatDate(conge.dateDebut)} - ${dateFin}`,
        jours: differenceBetweenDates(conge.dateDebut, conge.dateFin),
        _id: conge._id,
      });
    }
    return response;
  }

  @Post()
  @HttpCode(201)
  async createConge(@Body() congeDto: CongeDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = congeDto;
    const createCongeDto = rest as unknown as CreateCongeDTO;
    try {
      return await this.congeService.create(createCongeDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      const conges = await this.congeService.findAll();
      return this.listConges(conges);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.congeService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get('/agent/:agent')
  async findAllByAgent(@Param('agent') agent: string) {
    try {
      return await this.congeService.filterByAgent(agent);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateConge(@Body() updateCongeDto: CongeDTO) {
    try {
      return await this.congeService.update(
        updateCongeDto as unknown as CongeDTO,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
