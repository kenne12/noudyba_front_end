import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {Ville} from "../interface/ville";

@Injectable({
  providedIn: 'root'
})
export class VilleService {

  private readonly apiUrl = "http://localhost:8050/api/v1/ville";

  constructor(private http: HttpClient) {
  }


  villes$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  public findAll(): Ville [] {
    let villes: Ville[] = [];
    this.villes$.pipe().subscribe(data => {
      villes.push(...data.datas.villes);
    }, error => {
      console.log(error);
    })
    return villes;
  }


  save$ = (ville: Ville) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, ville)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  get_ville$ = (villeId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/` + villeId)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  delete$ = (villeId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + '/delete/' + villeId)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }

}
