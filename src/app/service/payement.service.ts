import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {PaymentRequest} from "../interface/payment.request";

@Injectable({
  providedIn: 'root'
})
export class PayementService {

  private readonly apiUrl = "http://localhost:8050/api/v1/payment";

  constructor(private http: HttpClient) {
  }


  payments$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  payments_by_annee$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (request: PaymentRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, request)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (paymentId: number, request: PaymentRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit/${paymentId}`, request)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (paymentId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${paymentId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  delete$ = (paymentId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + '/delete/' + paymentId)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }
}
