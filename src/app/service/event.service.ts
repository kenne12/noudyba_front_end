import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {Status} from "../enum/status.enum";
import {EventRequest} from "../interface/event.request";
import {EventResponse} from "../interface/event.response";

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly apiUrl = "http://localhost:8050/api/v1/evenement";

  constructor(private http: HttpClient) {
  }


  events$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (evenement: EventRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, evenement)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (eventId: number, evenement: EventRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit/${eventId}`, evenement)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (eventId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${eventId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  find_all_by_annee_id$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  getAll(anneeId: number): EventResponse [] {
    let events: EventResponse [] = [];
    this.find_all_by_annee_id$(anneeId).subscribe(response => {
      events.push(...response.datas.events)
    })
    return events;
  }


  delete$ = (eventId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + '/delete/' + eventId)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  filter$ = (status: any, response: CustomResponse) => <Observable<CustomResponse>>
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
      );


  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }


}
