import {AnneeResponse} from "./annee.response";
import {MembreResponse} from "./membre.response";
import {RubriqueResponse} from "./rubrique.response";

export interface OperationResponse {
  idOperation?: number;
  montant?: number;
  dateOperation?: any;
  heure?: any;
  libelle?: string;
  annee?: AnneeResponse;
  membre?: MembreResponse;
  //OperationType operationType;
  rubrique?: RubriqueResponse;
}
