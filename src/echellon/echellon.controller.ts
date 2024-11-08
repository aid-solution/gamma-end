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
  async create(@Body() echellonDto: EchellonDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...echellon } = echellonDto;
    try {
      return await this.echellonService.create(echellon);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async FindAll() {
    try {
      return await this.echellonService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.echellonService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.echellonService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  async updateEchellon(@Body() echellonDto: EchellonDTO) {
    const { _id, ...echellon } = echellonDto;
    try {
      return await this.echellonService.update(_id, echellon);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
