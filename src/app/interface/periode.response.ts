import {AnneeResponse} from "./annee.response";
import {Mois} from "./mois";
import {PeriodePk} from "./periode.pk";

export interface PeriodeResponse {
  periodePK?: PeriodePk
  shortName?: string;
  numero?: number;
  dateDebut?: any;
  dateFin?: any;
  mois?: Mois;
  annee?: AnneeResponse;
}
