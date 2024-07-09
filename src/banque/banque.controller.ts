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
import { BanqueService } from './banque.service';
import { BanqueDTO } from 'src/dto/Banque.dto';
import { CreateBanqueDTO } from 'src/dto/createBanque.dto';

@Controller('banque')
export class BanqueController {
  constructor(private readonly banqueService: BanqueService) {}

  @Post()
  @HttpCode(201)
  async createBanque(@Body() BanqueDto: BanqueDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...banque } = BanqueDto;
    const createBanqueDto = banque as unknown as CreateBanqueDTO;
    try {
      return await this.banqueService.create(createBanqueDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async banques() {
    try {
      return await this.banqueService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.banqueService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateBanque(@Body() BanqueDto: BanqueDTO) {
    const { _id, ...banque } = BanqueDto;
    const createBanqueDto = banque as unknown as CreateBanqueDTO;
    try {
      return await this.banqueService.update(_id, createBanqueDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
