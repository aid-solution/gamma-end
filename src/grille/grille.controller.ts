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
import { GrilleService } from './grille.service';
import { CreateGrilleDTO } from 'src/dto/createGrille.dto';
import { GrilleDTO } from 'src/dto/grille.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';

@Controller('grille')
export class GrilleController {
  constructor(private readonly grilleService: GrilleService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async create(@Body() grilleDto: GrilleDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...grille } = grilleDto;
    const createGrilleDto = grille as unknown as CreateGrilleDTO;
    try {
      return await this.grilleService.create(createGrilleDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.grilleService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.grilleService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  @UsePipes(ConvertToOriginalTypePipe)
  async update(@Body() grilleDto: GrilleDTO) {
    const { _id, ...grille } = grilleDto;
    const createGrilleDto = grille as unknown as CreateGrilleDTO;
    try {
      return await this.grilleService.update(_id, createGrilleDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
