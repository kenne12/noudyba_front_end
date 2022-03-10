import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {Status} from "../enum/status.enum";
import {RubriqueRequest} from "../interface/rubrique.request";
import {RubriqueResponse} from "../interface/rubrique.response";

@Injectable({
  providedIn: 'root'
})
export class RubriqueService {

  private readonly apiUrl = "http://localhost:8050/api/v1/rubrique";

  constructor(private http: HttpClient) {
  }


  rubriques$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (rubrique: RubriqueRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, rubrique)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (rubricId: number, rubrique: RubriqueRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit/${rubricId}`, rubrique)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (rubricId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${rubricId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  delete$ = (rubricId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + `/delete/${rubricId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  findAll(): RubriqueResponse [] {
    let rubriques: RubriqueResponse [] = [];
    this.rubriques$.subscribe(response => {
      rubriques.push(...response.datas.rubriques);
    }, error => {
      console.log(error);
    });
    return rubriques;
  }

  filter$ = (status: any, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      suscriber => {
        suscriber.next(
          status === Status.ALL ? {...response, message: `Annee filtered by ${status} status`} :
            {
              ...response,
              message: response.datas.annees
                .filter(annee => annee.etat === status).length > 0 ? `Années filtered by
                ${status === true ? 'Annee ACTIF'
                : 'Year INACTIF'} status` : `No years with ${status} found`,
              datas: {
                annees: response.datas.annees
                  .filter(annee => annee.etat === status)
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
