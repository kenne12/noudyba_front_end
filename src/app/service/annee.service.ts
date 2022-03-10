import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {Status} from "../enum/status.enum";
import {AnneeRequest} from "../interface/annee.request";
import {AnneeResponse} from "../interface/annee.response";

@Injectable({
  providedIn: 'root'
})
export class AnneeService {

  private readonly apiUrl = "http://localhost:8050/api/v1/annee";

  constructor(private http: HttpClient) {
  }


  annees$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (annee: AnneeRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, annee)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (idAnnee: number, annee: AnneeRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit/${idAnnee}`, annee)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (idAnnee: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/${idAnnee}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  delete$ = (anneeId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + `/delete/${anneeId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  findAll(): AnneeResponse [] {
    let annees: AnneeResponse [] = []
    this.annees$.subscribe(response => {
      annees.push(...response.datas.annees);
    }, error => {
      console.log(error);
    })
    return annees;
  }

  /*getDataByIdAnnee(anneeId): AnneeResponse {
    let annee: AnneeResponse;
    this.find_by_id$(anneeId).subscribe(response => {
      annee = {...response.datas.annee}
    }, error => {
      console.log(error);
    })
    return annee;
  }*/


  getDataByIdAnnee(anneeId: number) {
    return this.find_by_id$(anneeId)
      .toPromise()
      .then(res => <CustomResponse>res)
      .then(data => {
        return data.datas.annee
      })
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
