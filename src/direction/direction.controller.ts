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
import { DirectionService } from './direction.service';
import { DirectionDTO } from 'src/dto/direction.dto';

@Controller('direction')
export class DirectionController {
  constructor(private readonly directionService: DirectionService) {}

  @Post()
  @HttpCode(201)
  async createDirection(@Body() directionDto: DirectionDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...direction } = directionDto;
    try {
      return await this.directionService.create(direction as DirectionDTO);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.directionService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.directionService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateDirection(@Body() DirectionDto: DirectionDTO) {
    const { _id, ...Direction } = DirectionDto;
    const createDirectionDto = Direction as unknown as DirectionDTO;
    try {
      return await this.directionService.update(_id, createDirectionDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
