import {MembreResponse} from "./membre.response";
import {Ville} from "./ville";

export interface CustomResponse {
  timestamp: Date;
  statusCode: number;
  status: string;
  reason: string;
  message: string;
  developperMessage: string;
  data: {
    membres?: MembreResponse[], membre?: MembreResponse,
    ville?: Ville, villes?: Ville[]
  }

  datas: {
    membres?: MembreResponse[], membre?: MembreResponse,
    villes?: Ville[], ville?: Ville
  }

}
