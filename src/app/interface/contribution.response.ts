import {EventResponse} from "./event.response";
import {MembreResponse} from "./membre.response";

export interface ContributionResponse {
  idContribution: number,
  montant: number,
  dateContribution: any,
  evenement: EventResponse,
  membre: MembreResponse,
  libelle: string;
}
