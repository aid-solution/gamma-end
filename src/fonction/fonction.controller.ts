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
import { FonctionService } from './fonction.service';
import { FonctionDTO } from 'src/dto/fonction.dto';
import { SalaireService } from 'src/salaire/salaire.service';
import { AffectationRubriqueDTO } from 'src/dto/affectationRubrique.dto';
import { CreateFonctionRubriqueDTO } from 'src/dto/createFonctionRubrique.dto';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { FonctionRubrique } from 'src/schemas/users/fonctionRubrique.schema';
import {
  addOneMonth,
  getLastDayOfMonth,
  reduceOneDay,
} from 'src/utilities/formatDate';
import { FonctionRubriqueService } from 'src/fonction-rubrique/fonction-rubrique.service';
import { CreateFonctionDTO } from 'src/dto/createFonction.dto';
import { UpdateFonctionDTO } from 'src/dto/updateFonction.dto';

interface Obj {
  service?: string;
  direction?: string;
}

@Controller('fonction')
export class FonctionController {
  constructor(
    private readonly fonctionService: FonctionService,
    private readonly fonctionRubriqueService: FonctionRubriqueService,
    private readonly salaireService: SalaireService,
  ) {}

  private async getAllRubriqueFonction(
    oldRubrique: FonctionRubrique[],
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

  private async affectationRubriqueFonction(
    id: string,
    rubrique: AffectationRubriqueDTO[],
    idOfUsedRubrique: string[],
  ) {
    const affectationRubrique: CreateFonctionRubriqueDTO[] = [];
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
          fonction: id,
          montant: rub.montant,
          dateDebut: debut,
        } as unknown as CreateFonctionRubriqueDTO;
        affectationRubrique.push(affectation);
      }
    });
    return affectationRubrique;
  }

  @Post()
  @HttpCode(201)
  async create(@Body() fonctionDto: FonctionDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = fonctionDto;
    try {
      const { rubrique, ...fonctionObject } = rest;
      const obj: Obj = {};
      if (fonctionObject.rattache === 'Service')
        obj.service = fonctionObject.rattacheA;
      else obj.direction = fonctionObject.rattacheA;

      const fonctionDto = {
        libelle: fonctionObject.libelle,
        rattache: fonctionObject.rattache,
        ...obj,
      } as unknown as CreateFonctionDTO;
      const fonction = await this.fonctionService.create(fonctionDto);
      const affectationRubrique: CreateFonctionRubriqueDTO[] =
        await this.affectationRubriqueFonction(
          fonction._id.toString(),
          rubrique,
          [],
        );

      await this.fonctionRubriqueService.create(affectationRubrique);
      return fonction;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async FindAll() {
    try {
      return await this.fonctionService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.fonctionService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.fonctionService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  async updateFonction(@Body() fonctionDto: FonctionDTO) {
    try {
      const { _id, ...fonction } = fonctionDto;
      const oldRubrique =
        await this.fonctionRubriqueService.findAllByFonction(_id);

      const { rubrique, ...fonctionObject } = fonction;

      const { affectationRubriqueUpdate, idOfUsedRubrique } =
        await this.getAllRubriqueFonction(oldRubrique, rubrique);

      const affectationRubrique = await this.affectationRubriqueFonction(
        _id,
        rubrique,
        idOfUsedRubrique,
      );
      const dataToUpdate = {
        _id,
        ...fonctionObject,
      } as unknown as UpdateFonctionDTO;
      const fonctionUpdated = await this.fonctionService.update(dataToUpdate);
      if (affectationRubriqueUpdate.length > 0)
        await this.fonctionRubriqueService.update(affectationRubriqueUpdate);
      if (affectationRubrique.length > 0)
        await this.fonctionRubriqueService.create(affectationRubrique);
      return fonctionUpdated;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
