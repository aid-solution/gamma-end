import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { AffectationService } from './affectation.service';
import { CreateAffectationDTO } from 'src/dto/createAffectation.dto';

@Controller('affectation')
export class AffectationController {
  constructor(private affectationService: AffectationService) {}

  @Post()
  @HttpCode(201)
  async createAgent(@Body() affectationDTO: CreateAffectationDTO) {
    try {
      return await this.affectationService.create(affectationDTO);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
