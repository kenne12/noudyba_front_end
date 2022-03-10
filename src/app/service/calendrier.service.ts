import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {PeriodeRequest} from "../interface/periode.request";
import {CalendarForm} from "../interface/calendar.form";

@Injectable({
  providedIn: 'root'
})
export class CalendrierService {

  private readonly apiUrl = "http://localhost:8050/api/v1/calendrier";

  constructor(private http: HttpClient) {
  }


  periods_by_annee$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  data_to_save$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/calendar_data/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  /*getCalendarData(anneeId: number) {
    return this.http.get<CustomResponse>(`${this.apiUrl}/calendar_data/${anneeId}`)
      .toPromise()
      .then(res => <CustomResponse>res)
      .then(data => {
        return data;
      });
  }*/

  getCalendarData(anneeId: number) {
    return this.data_to_save$(anneeId)
      .toPromise()
      .then(res => <CustomResponse>res)
      .then(data => {
        return data
      })
  }

  save_one$ = (request: CalendarForm) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, request)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  edit_one$ = (request: PeriodeRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit`, request)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit_many$ = (request: PeriodeRequest []) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edits`, request)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (anneeId: number, moisId) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${anneeId}/${moisId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  delete_one$ = (anneeId: number, moisId) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + `/delete/${anneeId}/${moisId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  delete_many$ = (anneeId: number, moisId) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + `/delete/${anneeId}/${moisId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  private

  handleError(error
                :
                HttpErrorResponse
  ):
    Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }
}
