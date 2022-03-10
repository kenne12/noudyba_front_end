import {Injectable, Output, EventEmitter} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {map, tap} from 'rxjs/operators';
import {LoginRequestPayload} from "../interface/login.request.payload";
import {LoginResponse} from "../interface/login.response";
import jwt_decode from 'jwt-decode';
import {LocalStorageService} from "ngx-webstorage";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:8050/api';

  @Output() loggedIn: EventEmitter<boolean> = new EventEmitter();
  @Output() username: EventEmitter<string> = new EventEmitter();

  public currentUserSubject: BehaviorSubject<any> | null = null;

  refreshTokenPayload = {
    refreshToken: this.getRefreshToken(),
    username: this.getUserName()
  }

  public roles: Array<any> = [];
  public isAuthentified = false;

  public jwtDecode: any = null;

  constructor(private httpClient: HttpClient,
              private localStorage: LocalStorageService) {
  }


  cleanToken(token): string {
    let result = token.replace('Bearer ', '');
    return result;
  }

  login(request: LoginRequestPayload): Observable<boolean> {

    const body = new URLSearchParams();
    body.set('username', request.username);
    body.set('password', request.password);


    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`,
      body.toString(), {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }).pipe(map(data => {


      this.localStorage.store('access_token', this.cleanToken(data.access_token));
      this.localStorage.store('refresh_token', this.cleanToken(data.refresh_token));

      this.saveInfoToken(this.cleanToken(data.access_token))

      this.loggedIn.emit(true);
      this.username.emit(this.jwtDecode?.sub);
      return true;
    }));
  }

  public saveInfoToken(jwtToken: any): any {
    this.jwtDecode = jwt_decode(jwtToken);
    this.roles = this.jwtDecode?.roles;
    this.currentUserSubject?.next(this.jwtDecode.sub);
    this.isAuthentified = true;
    this.localStorage.store('username', this.jwtDecode.sub);
    this.localStorage.store('roles', this.roles);
    return this.jwtDecode;
  }


  refreshToken() {
    const body = new URLSearchParams();
    body.set('refresh_token', this.getRefreshToken());

    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/v1/user/refresh/token`,
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('Authorization', this.getRefreshToken())
      })
      .pipe(tap(response => {
        this.localStorage.clear('access_token');
        this.localStorage.store('access_token', response.access_token);
      }));
  }

  logout() {
    /*this.httpClient.post('http://localhost:8081/api/auth/logout', this.refreshTokenPayload,
      {responseType: 'text'})
      .subscribe(data => {
        console.log(data);
      }, error => {
        throwError(error);
      })*/
    this.localStorage.clear('access_token');
    this.localStorage.clear('username');
    this.localStorage.clear('refresh_token');
    this.localStorage.clear('roles');
    this.localStorage.clear('id_annee');
    this.localStorage.clear('date_debut');
    this.localStorage.clear('date_fin');
  }

  getJwtToken() {
    return this.localStorage.retrieve('access_token');
  }

  getUserName() {
    return this.localStorage.retrieve('username');
  }

  getRefreshToken() {
    return this.localStorage.retrieve('refresh_token');
  }

  isLoggedIn(): boolean {
    return this.getJwtToken() != null;
  }
}
