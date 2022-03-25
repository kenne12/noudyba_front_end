import {Injectable} from '@angular/core';
import {DatePipe} from "@angular/common";
import {Role} from "../interface/role";
import {Observable} from "rxjs";
import {HttpClient, HttpEvent, HttpRequest} from "@angular/common/http";
import {environment} from "../../environments/environment";


declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private readonly baseApiUrl = environment.BASE_API_URL;

  constructor(private http: HttpClient,
              private datePipe: DatePipe) {
  }

  public transformDate(date: any) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  public openModal(id: string): void {
    $(id).modal('show');
  }

  public closeModal(id: string): void {
    $(id).modal('hide');
  }


  public fromRoleToString(roles: Role[]): any[] {
    let list: any[] = [];
    roles.forEach(r => {
      list.push(r.name);
    })
    return list;
  }


  public uploadUserImage(file: File, idUser: any): Observable<HttpEvent<{}>> {
    const formdata: FormData = new FormData();
    formdata.append('file', file);
    const req = new HttpRequest('POST', this.baseApiUrl + '/' + idUser + '/uploadUserImage', formdata, {
      reportProgress: true,
      responseType: 'text'
    });
    return this.http.request(req);
  }
}
