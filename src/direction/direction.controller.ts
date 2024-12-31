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
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { CreateDirectionRubriqueDTO } from 'src/dto/createDirectionRubrique.dto';
import { AffectationRubriqueDTO } from 'src/dto/affectationRubrique.dto';
import { SalaireService } from 'src/salaire/salaire.service';
import { DirectionRubrique } from 'src/schemas/users/directionRubrique.schema';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import {
  addOneMonth,
  getLastDayOfMonth,
  reduceOneDay,
} from 'src/utilities/formatDate';

@Controller('direction')
export class DirectionController {
  constructor(
    private readonly directionService: DirectionService,
    private readonly directionRubriqueService: DirectionRubriqueService,
    private readonly salaireService: SalaireService,
  ) {}

  private async getAllRubriqueDirection(
    oldRubrique: DirectionRubrique[],
    rubrique: AffectationRubriqueDTO[],
  ) {
    const affectationRubriqueUpdate: UpdateAffectationRubriqueDTO[] = [];
    const idOfUsedRubrique: string[] = [];
    const currentSalary = await this.salaireService.findLast();
    const debut = currentSalary
      ? currentSalary.isRemunerated
        ? addOneMonth(
            new Date(`${currentSalary.annee}-${currentSalary.mois}-01`),
          )
        : new Date(`${currentSalary.annee}-${currentSalary.mois}-01`)
      : new Date();
    oldRubrique.map((old: any) => {
      const filter = rubrique.filter(
        (rub: any) => rub._id === old.rubrique._id.toString(),
      );

      if (!filter.length || (filter[0] && filter[0].montant !== old.montant)) {
        const affectation = {
          _id: old._id,
          dateFin: currentSalary.isRemunerated
            ? reduceOneDay(debut)
            : getLastDayOfMonth(debut),
        } as unknown as UpdateAffectationRubriqueDTO;
        affectationRubriqueUpdate.push(affectation);
      } else if (
        filter[0] &&
        filter[0].montant === old.montant &&
        old.dateFin === undefined
      ) {
        idOfUsedRubrique.push(filter[0]._id);
      }
    });
    return { affectationRubriqueUpdate, idOfUsedRubrique };
  }

  private async affectationRubriqueDirection(
    id: string,
    rubrique: AffectationRubriqueDTO[],
    idOfUsedRubrique: string[],
  ) {
    const affectationRubrique: CreateDirectionRubriqueDTO[] = [];
    const currentSalary = await this.salaireService.findLast();
    const debut = currentSalary
      ? currentSalary.isRemunerated
        ? addOneMonth(
            new Date(`${currentSalary.annee}-${currentSalary.mois}-01`),
          )
        : new Date(`${currentSalary.annee}-${currentSalary.mois}-01`)
      : new Date();
    rubrique.map((rub) => {
      if (!idOfUsedRubrique.includes(rub._id)) {
        const affectation = {
          rubrique: rub._id,
          direction: id,
          montant: rub.montant,
          dateDebut: debut,
        } as unknown as CreateDirectionRubriqueDTO;
        affectationRubrique.push(affectation);
      }
    });
    return affectationRubrique;
  }

  @Post()
  @HttpCode(201)
  async create(@Body() directionDto: DirectionDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, libelle, rubrique } = directionDto;
    try {
      const direction = await this.directionService.create(libelle);
      const affectationRubrique: CreateDirectionRubriqueDTO[] =
        await this.affectationRubriqueDirection(
          direction._id.toString(),
          rubrique,
          [],
        );

      await this.directionRubriqueService.create(affectationRubrique);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.directionService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.directionService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.directionService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  async update(@Body() directionDto: DirectionDTO) {
    const { _id, ...direction } = directionDto;
    try {
      const createDirectionDto = direction as unknown as DirectionDTO;
      const oldRubrique =
        await this.directionRubriqueService.findAllByDirection(_id);

      const { libelle, rubrique } = createDirectionDto;

      const { affectationRubriqueUpdate, idOfUsedRubrique } =
        await this.getAllRubriqueDirection(oldRubrique, rubrique);

      const affectationRubrique = await this.affectationRubriqueDirection(
        _id,
        rubrique,
        idOfUsedRubrique,
      );
      if (affectationRubriqueUpdate.length > 0)
        await this.directionRubriqueService.update(affectationRubriqueUpdate);
      if (affectationRubrique.length > 0)
        await this.directionRubriqueService.create(affectationRubrique);
      return await this.directionService.update(_id, libelle);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
