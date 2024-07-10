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
import { FonctionService } from './fonction.service';
import { FonctionDTO } from 'src/dto/fonction.dto';

@Controller('Fonction')
export class FonctionController {
  constructor(private readonly fonctionService: FonctionService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() fonctionDto: FonctionDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...fonction } = fonctionDto;
    try {
      return await this.fonctionService.create(fonction as FonctionDTO);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async FindAll() {
    try {
      return await this.fonctionService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.fonctionService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateFonction(@Body() fonctionDto: FonctionDTO) {
    const { _id, ...fonction } = fonctionDto;
    const createFonctionDto = fonction as unknown as FonctionDTO;
    try {
      return await this.fonctionService.update(_id, createFonctionDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
