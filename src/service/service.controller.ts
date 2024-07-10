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
import { ServiceService } from './service.service';
import { ServiceDTO } from 'src/dto/service.dto';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() serviceDto: ServiceDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...service } = serviceDto;
    try {
      return await this.serviceService.create(service as ServiceDTO);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.serviceService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.serviceService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  async updateService(@Body() serviceDto: ServiceDTO) {
    const { _id, ...service } = serviceDto;
    const createServiceDto = service as unknown as ServiceDTO;
    try {
      return await this.serviceService.update(_id, createServiceDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
