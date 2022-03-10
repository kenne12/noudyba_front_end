import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {SubscriptionRequest} from "../interface/subscription.request";
import {catchError, tap} from "rxjs/operators";
import {SubscriptionResponse} from "../interface/subscription.response";

@Injectable({
  providedIn: 'root'
})
export class SouscriptionService {

  private readonly apiUrl = "http://localhost:8050/api/v1/subscription";

  constructor(private http: HttpClient) {
  }


  subscriptions$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  subscriptions_by_annee$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  subs_not_paid_by_member$ = (memberId: number, anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/not_paid_by/member/${memberId}/annee/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  subs_not_paid_by_annee$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/not_paid_by/annee/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (souscription: SubscriptionRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, souscription)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (subscriptionId: number, souscription: SubscriptionRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit/${subscriptionId}`, souscription)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (subscriptionId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${subscriptionId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  delete$ = (subscriptionId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + '/delete/' + subscriptionId)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  getNotPaidByAnneeId(anneeId: number): SubscriptionResponse [] {
    let list: SubscriptionResponse[] = [];
    this.subs_not_paid_by_annee$(anneeId).subscribe(response => {
      list.push(...response.datas.subscriptions);
    }, error => console.log(error))
    return list;
  }


  /*filter$ = (status: any, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      suscriber => {
        suscriber.next(
          status === Status.ALL ? {...response, message: `Member filtered by ${status} status`} :
            {
              ...response,
              message: response.datas.membres
                .filter(membre => membre.state === status).length > 0 ? `Members filtered by
                ${status === true ? 'MEMBRE ACTIF'
                : 'MEMBRE INACTIF'} status` : `No members with ${status} found`,
              datas: {
                membres: response.datas.membres
                  .filter(member => member.state === status)
              }
            }
        );
        suscriber.complete();
      }
    )
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );*/


  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }
}
