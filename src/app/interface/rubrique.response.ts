import {RubriqueType} from "../enum/rubrique.type.enum";

export interface RubriqueResponse {

  idRubrique?: number,
  nom?: string,
  code?: string,
  rubricType?: RubriqueType

}
