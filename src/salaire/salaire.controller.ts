import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { SalaireService } from './salaire.service';
import { SalaireDTO } from 'src/dto/salaire.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';
import { ImprimeDTO } from 'src/dto/imprime.dto';

@Controller('salaire')
export class SalaireController {
  constructor(private readonly salaireService: SalaireService) {}

  @Get('/last-salary')
  async findLast() {
    try {
      return await this.salaireService.findLast();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.salaireService.findOne(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
  @Get()
  async findAll() {
    try {
      return await this.salaireService.findAll();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Post('/calcul-salaire')
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async CalculSalaire(@Body() salaireDto: SalaireDTO) {
    try {
      return await this.salaireService.CalculSalaire(salaireDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Post('/generate-document')
  @HttpCode(201)
  async generateDocument(@Body() document: ImprimeDTO) {
    try {
      return await this.salaireService.generateDocument(document);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
