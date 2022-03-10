import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {ContributionRequest} from "../interface/contribution.request";

@Injectable({
  providedIn: 'root'
})
export class ContributionService {

  private readonly apiUrl = "http://localhost:8050/api/v1/contribution";

  constructor(private http: HttpClient) {
  }


  contributions$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  contributions_by_annee$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (request: ContributionRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, request)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (contributionId: number, request: ContributionRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit/${contributionId}`, request)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (contributionId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${contributionId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  delete$ = (contributionId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + '/delete/' + contributionId)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }
}
