import {EventResponse} from "./event.response";
import {MembreResponse} from "./membre.response";

export interface SubscriptionResponse {
  idSouscription?: number,
  evenement?: EventResponse;
  membre?: MembreResponse;
  montant?: number,
  montantPaye?: number,
  dateSouscription?: any;
  libelle?: string;
}
