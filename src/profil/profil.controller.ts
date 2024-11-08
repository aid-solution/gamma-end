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
import { CreateProfilDTO } from 'src/dto/createProfil.dto';
import { ProfilDTO } from 'src/dto/profil.dto';
import { ProfilService } from './profil.service';

@Controller('profil')
export class ProfilController {
  constructor(private readonly profilService: ProfilService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() profilDto: ProfilDTO) {
    delete profilDto._id;
    const createProfilDto = profilDto as unknown as CreateProfilDTO;
    try {
      return await this.profilService.create(createProfilDto);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.profilService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.profilService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.profilService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  async updateProfil(@Body() ProfilDto: ProfilDTO) {
    const { _id, ...profil } = ProfilDto;
    const createProfilDto = profil as unknown as CreateProfilDTO;
    try {
      return await this.profilService.update(_id, createProfilDto);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
