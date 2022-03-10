import {AnneeResponse} from "./annee.response";
import {RubriqueResponse} from "./rubrique.response";

export interface EventResponse {
  idEvenement?: number,
  code?: string,
  rubrique?: RubriqueResponse,
  annee: AnneeResponse,
  dateDebut?: any,
  dateFin?: any,
  commentaire?: string
}
