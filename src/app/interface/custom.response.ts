import {MembreResponse} from "./membre.response";
import {Ville} from "./ville";
import {AnneeResponse} from "./annee.response";
import {EventResponse} from "./event.response";
import {RubriqueResponse} from "./rubrique.response";
import {SubscriptionResponse} from "./subscription.response";
import {PaymentResponse} from "./payment.response";
import {ContributionResponse} from "./contribution.response";
import {PeriodeResponse} from "./periode.response";
import {Mois} from "./mois";
import {CalendarDataResponse} from "./calendar.data.response";
import {DashboardDataResponse} from "./dashboard.data.response";
import {UtilisateurResponse} from "./utilisateur.response";
import {Role} from "./role";

export interface CustomResponse {
  timestamp: Date;
  statusCode: number;
  status: string;
  reason: string;
  message: string;
  developperMessage: string;

  datas: {
    membres?: MembreResponse[], membre?: MembreResponse,
    villes?: Ville[], ville?: Ville,
    annees?: AnneeResponse[], annee?: AnneeResponse,
    events?: EventResponse[], event?: EventResponse,
    rubriques?: RubriqueResponse [], rubrique?: RubriqueResponse,
    subscriptions?: SubscriptionResponse [], subscription?: SubscriptionResponse,
    payments?: PaymentResponse[], payment?: PaymentResponse,
    contributions?: ContributionResponse [], contribution?: ContributionResponse,
    periods?: PeriodeResponse [], period?: PeriodeResponse,
    months?: Mois[], month?: Mois,
    calendar?: CalendarDataResponse,
    dashboard?: DashboardDataResponse,
    users?: UtilisateurResponse [],
    user?: UtilisateurResponse,
    roles?: Role[]
  }
}
