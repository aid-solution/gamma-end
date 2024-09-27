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
import { BanqueDTO } from 'src/dto/banque.dto';
import { CreateBanqueDTO } from 'src/dto/createBanque.dto';

@Controller('banque')
export class BanqueController {
  constructor(private readonly banqueService: BanqueService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() banqueDto: BanqueDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...banque } = banqueDto;
    const createBanqueDto = banque as unknown as CreateBanqueDTO;
    try {
      return await this.banqueService.create(createBanqueDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
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

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.banqueService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateBanque(@Body() banqueDto: BanqueDTO) {
    const { _id, ...banque } = banqueDto;
    const createBanqueDto = banque as unknown as CreateBanqueDTO;
    try {
      return await this.banqueService.update(_id, createBanqueDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
