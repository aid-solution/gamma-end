import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { DirectionRubriqueService } from './direction-rubrique.service';

@Controller('direction-rubrique')
export class DirectionRubriqueController {
  constructor(
    private readonly directionRubriqueService: DirectionRubriqueService,
  ) {}

  @Get(':direction')
  async findOne(@Param('direction') direction: string) {
    try {
      return await this.directionRubriqueService.findAllByDirection(direction);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
