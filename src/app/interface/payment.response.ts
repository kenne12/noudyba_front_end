import {SubscriptionResponse} from "./subscription.response";

export interface PaymentResponse {
  idPayementSouscription?: number,
  souscription?: SubscriptionResponse,
  montant?: number,
  datePayement?: any;
}
