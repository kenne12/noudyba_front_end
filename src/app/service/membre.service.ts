import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpRequest} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {MembreRequest} from "../interface/membre.request";
import {catchError, tap} from "rxjs/operators";
import {Status} from "../enum/status.enum";
import {MembreResponse} from "../interface/membre.response";

@Injectable({
  providedIn: 'root'
})
export class MembreService {

  private readonly apiUrl = 'http://localhost:8050/api/v1/membre';

  constructor(private http: HttpClient) {
  }


  membres$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (membre: MembreRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/save`, membre)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (idMembre: number, membre: MembreRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.apiUrl}/edit/` + idMembre, membre)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (idMembre: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/get/` + idMembre)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_state$ = (state: boolean) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.apiUrl}/list/all?state=${state}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  upload_$ = (idMembre: number, data) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.apiUrl}/upload/${idMembre}`, data, {
    reportProgress: true,
    responseType: 'json'
  })
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  delete$ = (memberId: number) => <Observable<CustomResponse>>this.http.delete<CustomResponse>(this.apiUrl + '/delete/' + memberId)
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


  public getImage(image_name: string) {

  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }


  upload(idMembre: number, file: File): Observable<CustomResponse | HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload/${idMembre}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  getAll(state: boolean): MembreResponse[] {
    let members: MembreResponse [] = [];
    this.find_by_state$(state).subscribe(response => {
      members.push(...response.datas.membres);
    }, error => {
      console.log(error)
    })
    return members;
  }

}
