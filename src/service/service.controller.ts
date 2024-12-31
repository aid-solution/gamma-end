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
import { AffectationRubriqueDTO } from 'src/dto/affectationRubrique.dto';
import { CreateServiceRubriqueDTO } from 'src/dto/createServiceRubrique.dto';
import { UpdateAffectationRubriqueDTO } from 'src/dto/updateAffectationRubrique.dto';
import { SalaireService } from 'src/salaire/salaire.service';
import { ServiceRubrique } from 'src/schemas/users/serviceRubrique.schema';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';
import {
  addOneMonth,
  getLastDayOfMonth,
  reduceOneDay,
} from 'src/utilities/formatDate';

@Controller('service')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly serviceRubriqueService: ServiceRubriqueService,
    private readonly salaireService: SalaireService,
  ) {}

  private async getAllRubriqueService(
    oldRubrique: ServiceRubrique[],
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

  private async affectationRubriqueService(
    id: string,
    rubrique: AffectationRubriqueDTO[],
    idOfUsedRubrique: string[],
  ) {
    const affectationRubrique: CreateServiceRubriqueDTO[] = [];
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
          service: id,
          montant: rub.montant,
          dateDebut: debut,
        } as unknown as CreateServiceRubriqueDTO;
        affectationRubrique.push(affectation);
      }
    });
    return affectationRubrique;
  }

  @Post()
  @HttpCode(201)
  async create(@Body() serviceDto: ServiceDTO) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...serviceObject } = serviceDto;
      const { libelle, direction, rubrique } = serviceObject;

      const service = await this.serviceService.create(libelle, direction);

      const affectationRubrique: CreateServiceRubriqueDTO[] =
        await this.affectationRubriqueService(
          service._id.toString(),
          rubrique,
          [],
        );

      await this.serviceRubriqueService.create(affectationRubrique);

      return service;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.serviceService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.serviceService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Get('/duplicate/:search')
  async researchDuplicate(@Param('search') search: string) {
    try {
      return await this.serviceService.researchDuplicate(search);
    } catch (error) {
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }

  @Patch()
  async updateService(@Body() serviceDto: ServiceDTO) {
    try {
      const { _id, ...service } = serviceDto;
      const oldRubrique =
        await this.serviceRubriqueService.findAllByService(_id);

      const { libelle, direction, rubrique } = service;

      const { affectationRubriqueUpdate, idOfUsedRubrique } =
        await this.getAllRubriqueService(oldRubrique, rubrique);

      const affectationRubrique = await this.affectationRubriqueService(
        _id,
        rubrique,
        idOfUsedRubrique,
      );
      const serviceUpdated = await this.serviceService.update(
        _id,
        libelle,
        direction,
      );
      if (affectationRubriqueUpdate.length > 0)
        await this.serviceRubriqueService.update(affectationRubriqueUpdate);
      if (affectationRubrique.length > 0)
        await this.serviceRubriqueService.create(affectationRubrique);
      return serviceUpdated;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('an_unknow_exception_raised');
    }
  }
}
