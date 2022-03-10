import {EventResponse} from "./event.response";
import {MembreResponse} from "./membre.response";

export interface SouscriptionResponse {
  idSouscription?: number,
  evenement?: EventResponse;
  membre?: MembreResponse;
  montant?: number,
  montantPaye?: number,
  dateSouscription?: any;
}
