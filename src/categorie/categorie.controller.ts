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
import { CategorieService } from './categorie.service';

// the characteristics of EchelloDTO correspond exactly to those expected here
import { EchellonDTO } from 'src/dto/echellon.dto';

@Controller('categorie')
export class CategorieController {
  constructor(private readonly categorieService: CategorieService) {}

  @Post()
  @HttpCode(201)
  async createEchellon(@Body() echellonDto: EchellonDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...echellon } = echellonDto;
    try {
      return await this.categorieService.create(echellon);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async FindAll() {
    try {
      return await this.categorieService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.categorieService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateEchellon(@Body() echellonDto: EchellonDTO) {
    const { _id, ...echellon } = echellonDto;
    try {
      return await this.categorieService.update(_id, echellon);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
