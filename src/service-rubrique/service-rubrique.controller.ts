import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { ServiceRubriqueService } from './service-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { DirectionRubriqueDocument } from 'src/schemas/users/directionRubrique.schema';
import { ServiceRubriqueDocument } from 'src/schemas/users/serviceRubrique.schema';

@Controller('service-rubrique')
export class ServiceRubriqueController {
  constructor(
    private readonly serviceRubriqueService: ServiceRubriqueService,
    private readonly directionRubriqueService: DirectionRubriqueService,
  ) {}

  private combineRubrique(
    serviceRubrique: ServiceRubriqueDocument[],
    directionRubrique: DirectionRubriqueDocument[],
  ) {
    const result: any[] = [];
    this.insertInArray(serviceRubrique, result);
    this.insertInArray(directionRubrique, result);

    return result;
  }

  private insertInArray(tableau: any[], tableauRetour: any[]) {
    for (const tab of tableau) {
      tableauRetour.push({
        _id: tab.rubrique._id,
        code: tab.rubrique.code,
        origine: tab.direction ? tab.direction.libelle : '',
        rubrique: tab.rubrique.libelle,
        dateDebut: tab.dateDebut,
        dateFin: tab.dateFin,
        montant: tab.montant,
      });
    }
  }

  @Get(':service/:direction')
  async findOne(
    @Param('service') service: string,
    @Param('direction') direction: string,
  ) {
    try {
      const serviceRubrique =
        await this.serviceRubriqueService.findAllByService(service);
      const directionRubrique =
        await this.directionRubriqueService.findAllByDirectionAndRubriqueOnGoing(
          direction,
        );

      return this.combineRubrique(serviceRubrique, directionRubrique);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
