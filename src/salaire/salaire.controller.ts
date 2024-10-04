import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
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

  @Post()
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async findSalary(@Body() salaireDto: SalaireDTO) {
    try {
      return await this.salaireService.find(
        +salaireDto.mois,
        +salaireDto.annee,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Post('/generate-document')
  @HttpCode(201)
  async generateDocument(@Body() document: ImprimeDTO) {
    try {
      return await this.salaireService.imprime(document);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
