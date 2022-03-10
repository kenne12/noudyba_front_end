import {RubriqueType} from "../enum/rubrique.type.enum";

export interface RubriqueRequest{
  idRubrique: number,
  nom: string,
  code: string,
  rubricType: RubriqueType
}
