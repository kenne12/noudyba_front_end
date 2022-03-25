import {Injectable} from '@angular/core';
import {Observable, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom.response";
import {catchError, tap} from "rxjs/operators";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {UtilisateurRequest} from "../interface/utilisateur.request";
import {UtilisateurResponse} from "../interface/utilisateur.response";

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  public baseUrl = environment.BASE_API_URL + '/user';
  public utilisateur: UtilisateurResponse = {};
  public listUtilisateurs: UtilisateurResponse[] = [];

  constructor(private http: HttpClient) {
  }


  utilisateur$ = <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.baseUrl}/all`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (user: UtilisateurRequest) => <Observable<CustomResponse>>this.http.post<CustomResponse>(`${this.baseUrl}/save`, user)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  edit$ = (userId: number, user: UtilisateurRequest) => <Observable<CustomResponse>>this.http.put<CustomResponse>(`${this.baseUrl}/edit/${userId}`, user)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  find_by_id$ = (userId: number) => <Observable<CustomResponse>>this.http.get<CustomResponse>(`${this.baseUrl}/get/${userId}`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  user_roles$ = (username: any) => <Observable<CustomResponse>>this.http.get<CustomResponse>(this.baseUrl + '/' + username + '/absent_roles')
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  add_roles_to_user$ = (username: any, roles: Array<any>) => <Observable<CustomResponse>>this.http.post(`${this.baseUrl}/add_roles`, {
    username: username,
    roleNames: roles
  })
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  revoke_roles_to_user$ = (username: any, roles: Array<any>) => <Observable<CustomResponse>>this.http.post(`${this.baseUrl}/remove_roles`, {
    username: username,
    roleNames: roles
  })
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );


  public saveUserAccess(username: any, accesses: Array<any>): Observable<UtilisateurResponse> {
    return this.http.post<UtilisateurResponse>(this.baseUrl + '/add_roles', accesses);
  }

  public getAbsentRolesByUsername(username: any): Observable<CustomResponse> {
    return this.http.get<CustomResponse>(this.baseUrl + '/' + username + '/absent_roles');
  }


  getById(id: number): Observable<UtilisateurResponse> {
    return this.http.get<UtilisateurResponse>(this.baseUrl + '/' + id);
  }

  create(info: object): Observable<object> {
    return this.http.post(this.baseUrl + '/save', info);
  }

  update(id: any, value: object): Observable<object> {
    return this.http.put(this.baseUrl + '/' + id + '/edit', value);
  }

  delete(id: any): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id + '/delete');
  }

  public getAll(): Observable<UtilisateurResponse[]> {
    return this.http.get<UtilisateurResponse[]>(this.baseUrl + '/all');
  }


  public removeUserAccess(username: any, roles: Array<any>): Observable<UtilisateurResponse> {
    return this.http.post<UtilisateurResponse>(this.baseUrl + '/' + username + '/remove_roles', {
      username: username,
      roles: roles
    });
  }

  getByEtat(etat: boolean): Observable<UtilisateurResponse[]> {
    return this.http.get<UtilisateurResponse[]>(this.baseUrl + '/all/search/etat?etat=' + etat);
  }

  public findByNomOrPrenom(keyword: string): Observable<UtilisateurResponse[]> {
    return this.http.get<UtilisateurResponse[]>(this.baseUrl + '/all/search/nomOrPrenom?keyword=' + keyword);
  }

  public changeEtat(value: UtilisateurResponse): Observable<UtilisateurResponse> {
    value.actif = !value.actif;
    return this.http.put<UtilisateurResponse>(this.baseUrl + '/changeState/' + value.idUtilisateur, value);
  }

  public resetPassword(value: UtilisateurResponse): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(this.baseUrl + '/resetPassword/' + value.idUtilisateur, value);
  }

  public fromResponseToRequest(userResponse: UtilisateurResponse): UtilisateurRequest {
    const userRequest: UtilisateurRequest = {};
    userRequest.idUtilisateur = userResponse.idUtilisateur;
    userRequest.nom = userResponse.nom;
    userRequest.prenom = userResponse.prenom;
    userRequest.username = userResponse.username;
    userRequest.password = userResponse.password;
    userRequest.repeatPassword = userResponse.password;
    userRequest.actif = userResponse.actif;
    return userRequest;
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured = Error code:  ${error.status}`);
  }

}
