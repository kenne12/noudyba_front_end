import {Injectable} from '@angular/core';
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl = "http://localhost:8050/api/v1/dashboard";

  constructor(private http: HttpClient) {
  }

  dashboard$ = (anneeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  getAll(anneeId: number) {
    return this.http.get<CustomResponse>(`${this.apiUrl}/get/${anneeId}`);
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }
}
