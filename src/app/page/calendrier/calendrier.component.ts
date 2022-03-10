import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {Status} from "../../enum/status.enum";
import {FormGroup} from "@angular/forms";
import {ContributionResponse} from "../../interface/contribution.response";
import {ContributionRequest} from "../../interface/contribution.request";
import {NotificationServiceService} from "../../service/notification.service.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {UtilService} from "../../service/util.service";
import {LocalStorageService} from "ngx-webstorage";
import {catchError, map, startWith} from "rxjs/operators";
import {CalendrierService} from "../../service/calendrier.service";
import {PeriodeResponse} from "../../interface/periode.response";
import {AnneeService} from "../../service/annee.service";
import {Mois} from "../../interface/mois";
import {CalendarDataResponse} from "../../interface/calendar.data.response";
import {CalendarForm} from "../../interface/calendar.form";
import {PeriodeRequest} from "../../interface/periode.request";

@Component({
  selector: 'app-calendrier',
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.css']
})
export class CalendrierComponent implements OnInit {

  appState$: Observable<AppState<CustomResponse>> | null = null;
  readonly DataSate = DataState;
  readonly Status = Status;
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  displayModal: boolean;
  headerText: string = ""
  calendrierForm: FormGroup = new FormGroup({});


  listMonths: Mois[] = [];
  selectedMonths: Mois[] = [];
  periods: PeriodeResponse[] = [];

  calendarData: CalendarDataResponse = {};

  anneeId: number;

  clonedPeriods: { [s: string]: PeriodeResponse; } = {};

  constructor(
    private calendrierService: CalendrierService,
    private notifier: NotificationServiceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private utilService: UtilService,
    private localStorage: LocalStorageService,
    private anneeService: AnneeService) {
    this.anneeId = parseInt(this.localStorage.retrieve("id_annee"));
  }


  ngOnInit(): void {
    this.appState$ = this.calendrierService.data_to_save$(this.anneeId)
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {calendar: response.datas.calendar}}
          }
        }),
        startWith({dataState: DataState.LOADING_STATE}),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
    this.load();
  }

  async load() {
    let data = await this.calendrierService.getCalendarData(this.anneeId);
    this.calendarData = data.datas.calendar;
    this.periods = [];
    this.listMonths = [];
    this.periods = [...data.datas.calendar.periods]
    this.listMonths.push(...data.datas.calendar.months);
  }

  getCalendarData(value: Observable<AppState<CustomResponse>>) {
    return value.toPromise()
      .then(res => <AppState<CustomResponse>>res)
      .then(data => {
        return data.appData.datas.calendar;
      })
  }


  delete(periode: PeriodeResponse): void {
    /*this.confirmationService.confirm({
      message: `Are you sure you want to delete this operation of ${contribution.membre.nom} ${contribution.membre.prenom} ?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appState$ = this.contributionService.delete$(contribution.idContribution)
          .pipe(
            map(response => {
              this.notifier.onSuccess(response.message);
              this.dataSubject.next(
                {
                  ...response, datas:
                    {contributions: this.dataSubject.value.datas.contributions.filter(item => item.idContribution !== contribution.idContribution)}
                }
              )
              return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
            }),
            startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
            catchError((error: string) => {
              this.notifier.onError(error);
              return of({dataState: DataState.ERROR_STATE, error: error})
            })
          );
      }
    });*/
  }


  onRowEditInit(periode: PeriodeResponse) {
    this.clonedPeriods[periode.mois.code] = {...periode};
  }

  onRowEditSave(periode: PeriodeResponse) {
    if (periode.numero && periode.dateFin && periode.dateFin) {
      delete this.clonedPeriods[periode.mois.code];
      this.messageService.add({severity: 'success', summary: 'Success', detail: 'Period is updated'});
    } else {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Invalid Data'});
    }
  }

  onRowEditCancel(product: PeriodeResponse, index: number) {
    /*this.products2[index] = this.clonedProducts[product.id];
    delete this.products2[product.id];*/
  }

  printReport(): void {

  }


  public prepareCreateNewCalendar(): void {
    this.headerText = "Create New Calendar"
    this.displayModal = true;
  }

  public closeModal() {
    this.displayModal = false;
    //this.contributionRequest = this.initFormCreate();
    //this.calendrierForm.reset(this.contributionRequest)
  }


  setDataFromView(periode: PeriodeResponse) {
    //this.contributionRequest = this.fromResponseToRequest(contribution);
  }

  public prepareEdit(periode: PeriodeResponse): void {
    this.headerText = "Edit Calendar";
    this.setDataFromView(periode)
    this.displayModal = true;
  }

  fromResponseToRequest(contribution: ContributionResponse): ContributionRequest {
    let value: ContributionRequest = {
      idContribution: contribution.idContribution,
      idEvenement: contribution.evenement.idEvenement,
      idMembre: contribution.membre.idMembre,
      dateContribution: this.utilService.transformDate(contribution.dateContribution),
      montant: contribution.montant,
    };
    return value;
  }


  addMonths() {
    this.selectedMonths.forEach(item => {
      let val: PeriodeResponse = {};
      val.mois = item;
      val.shortName = item.code;
      this.periods = [...this.periods, val];
      let index = this.listMonths.indexOf(item);
      if (index !== -1) {
        this.listMonths.splice(index, 1);
      }
      this.selectedMonths = [];
    })
  }

  fromPeriodeResposeToRequest(periode: PeriodeResponse): PeriodeRequest {
    let value: PeriodeRequest = {
      idMois: periode.mois.id,
      numero: periode.numero,
      shortName: periode.shortName,
      dateDebut: this.utilService.transformDate(periode.dateDebut),
      dateFin: this.utilService.transformDate(periode.dateFin)
    }
    return value;
  }

  initVar(custom: CustomResponse) {
    this.calendarData = {...custom.datas.calendar};
    this.periods = [];
    this.listMonths = [];
    this.periods = [...custom.datas.calendar.periods]
    this.listMonths.push(...custom.datas.calendar.months);
  }

  save() {
    let periodForm: CalendarForm = {periods: []};
    periodForm.idAnnee = this.anneeId;
    this.periods.forEach(item => {
      periodForm.periods.push(this.fromPeriodeResposeToRequest(item))
    });

    this.isLoading.next(true);
    this.appState$ = this.calendrierService.save_one$(periodForm)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {
              ...response,
              datas: {calendar: response.datas.calendar}
            }
          );
          this.isLoading.next(false);
          this.notifier.onSuccess(response.message);
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
          this.initVar(response);
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.isLoading.next(false);
          this.notifier.onError(error);
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }
}
