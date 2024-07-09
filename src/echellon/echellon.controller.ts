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
import { EchellonService } from './echellon.service';
import { EchellonDTO } from 'src/dto/echellon.dto';

@Controller('echellon')
export class EchellonController {
  constructor(private readonly echellonService: EchellonService) {}

  @Post()
  @HttpCode(201)
  async createEchellon(@Body() EchellonDto: EchellonDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...echellon } = EchellonDto;
    try {
      return await this.echellonService.create(echellon);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async Echellons() {
    try {
      return await this.echellonService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.echellonService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateEchellon(@Body() EchellonDto: EchellonDTO) {
    const { _id, ...echellon } = EchellonDto;
    try {
      return await this.echellonService.update(_id, echellon);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
