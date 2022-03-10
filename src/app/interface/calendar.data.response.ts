import {PeriodeResponse} from "./periode.response";
import {Mois} from "./mois";

export interface CalendarDataResponse {
  periods?: PeriodeResponse [];
  months?: Mois [];
}
