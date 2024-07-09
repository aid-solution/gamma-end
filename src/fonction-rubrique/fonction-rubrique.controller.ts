import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { FonctionRubriqueService } from './fonction-rubrique.service';
import { DirectionRubriqueService } from 'src/direction-rubrique/direction-rubrique.service';
import { ServiceRubriqueService } from 'src/service-rubrique/service-rubrique.service';

@Controller('fonction-rubrique')
export class FonctionRubriqueController {
  constructor(
    private readonly fonctionRubriqueService: FonctionRubriqueService,
    private readonly serviceRubriqueService: ServiceRubriqueService,
    private readonly directionRubriqueService: DirectionRubriqueService,
  ) {}

  private combineRubrique(fonctionRubrique: any[], rattacheRubrique: any[]) {
    const result: any[] = [];
    this.insertInArray(fonctionRubrique, result);
    this.insertInArray(rattacheRubrique, result);

    return result;
  }

  private insertInArray(tableau: any[], tableauRetour: any[]) {
    for (const tab of tableau) {
      tableauRetour.push({
        _id: tab.rubrique._id,
        code: tab.rubrique.code,
        rattacheA: tab.service
          ? tab.service.libelle
          : tab.direction
            ? tab.direction.libelle
            : '--',
        rubrique: tab.rubrique.libelle,
        dateDebut: tab.dateDebut,
        dateFin: tab.dateFin,
        montant: tab.montant,
      });
    }
  }

  @Get(':fonction/:rattache/:rattacheA')
  async findOne(
    @Param('fonction') fonction: string,
    @Param('rattache') rattache: string,
    @Param('rattacheA') rattacheA: string,
  ) {
    try {
      const fonctionRubrique =
        await this.fonctionRubriqueService.findAllByFonction(fonction);
      const rattacheRubrique =
        rattache === 'Service'
          ? await this.serviceRubriqueService.findAllByServiceAndRubriqueOnGoing(
              rattacheA,
            )
          : await this.directionRubriqueService.findAllByDirectionAndRubriqueOnGoing(
              rattacheA,
            );

      return this.combineRubrique(fonctionRubrique, rattacheRubrique);
    } catch (error) {
      throw new InternalServerErrorException('An unknow exception raised');
    }
  }
}
