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
import { RubriqueService } from './rubrique.service';
import { ConvertToOriginalTypePipe } from 'src/pipes/convertToOriginalType.pipe';
import { CreateRubriqueDTO } from 'src/dto/createRubrique.dto';
import { RubriqueDTO } from 'src/dto/rubrique.dto';

@Controller('rubrique')
export class RubriqueController {
  constructor(private readonly rubriqueService: RubriqueService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(ConvertToOriginalTypePipe)
  async create(@Body() rubriqueDto: RubriqueDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rubrique } = rubriqueDto;
    const createRubriqueDto = rubrique as unknown as CreateRubriqueDTO;
    try {
      return await this.rubriqueService.create(createRubriqueDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.rubriqueService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
  @Get('avance-pret')
  async findAllAvancePret() {
    try {
      return await this.rubriqueService.findAllAvancePret();
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.rubriqueService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.rubriqueService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }

  @Patch()
  @UsePipes(ConvertToOriginalTypePipe)
  async update(@Body() rubriqueDto: RubriqueDTO) {
    const { _id, ...rubrique } = rubriqueDto;
    const createRubriqueDto = rubrique as unknown as CreateRubriqueDTO;
    try {
      return await this.rubriqueService.update(_id, createRubriqueDto);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
