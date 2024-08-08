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
import { AvancePretService } from './avance-pret.service';
import { AvancePretDTO } from 'src/dto/avancePret.dto';
import { CreateAvancePretDTO } from 'src/dto/createAvancePret.dto';
import { UpdateAvancePretDTO } from 'src/dto/updateAvancePret.dto';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';

@Controller('avance-pret')
export class AvancePretController {
  constructor(private readonly avancePretService: AvancePretService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async createAbsence(@Body() avancePretDto: AvancePretDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = avancePretDto;
    const createAvancePretDto = rest as unknown as CreateAvancePretDTO;
    try {
      return await this.avancePretService.create(createAvancePretDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.avancePretService.findAll();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.avancePretService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  @UsePipes(ConvertToOriginalTypePipe)
  async updateAbsence(@Body() updateAvancePretDto: AvancePretDTO) {
    try {
      return await this.avancePretService.update(
        updateAvancePretDto as unknown as UpdateAvancePretDTO,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
