import {Injectable} from '@angular/core';
import {DatePipe} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private datePipe: DatePipe) {
  }

  public transformDate(date: any) {
    /*return this.datePipe.transform(date, 'yyyy-MM-dd');*/
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
