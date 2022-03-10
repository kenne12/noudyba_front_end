import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {Status} from "../../enum/status.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationServiceService} from "../../service/notification.service.service";
import {ConfirmationService} from "primeng/api";
import {catchError, map, startWith} from "rxjs/operators";
import {RubriqueResponse} from "../../interface/rubrique.response";
import {AnneeResponse} from "../../interface/annee.response";
import {EventResponse} from "../../interface/event.response";
import {EventRequest} from "../../interface/event.request";
import {UtilService} from "../../service/util.service";
import {EventService} from "../../service/event.service";
import {AnneeService} from "../../service/annee.service";
import {RubriqueService} from "../../service/rubrique.service";
import {LocalStorageService} from "ngx-webstorage";

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  appState$: Observable<AppState<CustomResponse>> | null = null;
  readonly DataSate = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  displayModal: boolean;
  headerText: string = ""
  private crudMode = "";
  eventForm: FormGroup = new FormGroup({});

  memberState: any[];
  listRubriques: RubriqueResponse[] = [];
  listAnnees: AnneeResponse[] = [];

  selectedEvents: EventResponse[] = [];

  eventRequest: EventRequest = {
    idEvenement: null,
  };
  private anneeId: number;


  constructor(private eventService: EventService,
              private notifier: NotificationServiceService,
              private anneeService: AnneeService,
              private rubriqueService: RubriqueService,
              private confirmationService: ConfirmationService,
              private utilService: UtilService,
              private localStorage: LocalStorageService) {
    this.memberState = [
      {label: 'Off', value: false},
      {label: 'On', value: true},
    ];

    this.listAnnees = this.anneeService.findAll();
    this.listRubriques = this.rubriqueService.findAll();

    this.eventRequest = this.initFormCreate();
    this.initEventForm(this.eventRequest);
    this.anneeId = parseInt(this.localStorage.retrieve("id_annee"));
  }


  ngOnInit(): void {
    this.appState$ = this.eventService.find_all_by_annee_id$(this.anneeId)
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {events: response.datas.events.reverse()}}
          }
        }),
        startWith({dataState: DataState.LOADING_STATE}),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  private initFormCreate() {
    let eventRequest: EventRequest = {
      idEvenement: null,
      idRubrique: null,
      idAnnee: null,
      dateDebut: this.utilService.transformDate(new Date()),
      dateFin: this.utilService.transformDate(new Date()),
      commentaire: ''
    };
    return eventRequest;
  }

  get f() {
    return this.eventForm.controls;
  }


  saveEvent(): void {

    if (this.eventForm.invalid) {
      return
    }

    this.isLoading.next(true);
    if (this.crudMode === "Create") {

      this.appState$ = this.eventService.save$(this.eventForm.value as EventRequest)
        .pipe(
          map(response => {
            this.dataSubject.next(
              {
                ...response,
                datas: {events: [response.datas.event, ...this.dataSubject.value.datas.events]}
              }
            );
            this.isLoading.next(false);
            this.eventRequest = this.initFormCreate();
            this.eventForm.reset(this.eventRequest)
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
          }),
          startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
          catchError((error: string) => {
            this.isLoading.next(false);
            this.notifier.onError(error);
            return of({dataState: DataState.ERROR_STATE, error: error})
          })
        );
      return;
    }

    if (this.crudMode === "Edit") {

      this.appState$ = this.eventService.edit$(this.eventForm.value.idEvenement, this.eventForm.value as EventRequest)
        .pipe(
          map(response => {
            const index = this.dataSubject.value.datas.events.findIndex(event => event.idEvenement === response.datas.event?.idEvenement);
            this.dataSubject.value.datas.events[index] = response.datas.event;
            this.isLoading.next(false);
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.eventRequest = this.initFormCreate();
            return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
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

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    /*this.appState$ = this.membreService.ping$(ipAddress)
      .pipe(
        map(response => {
          const index = this.dataSubject.value.datas.membres.findIndex(membre => membre.idMembre === response.datas.membre?.idMembre);
          this.dataSubject.value.datas.membres[index] = response.datas.membre;
          this.filterSubject.next('');
          this.notifier.onSuccess(response.message);
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.filterSubject.next('');
          this.notifier.onError(error);
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );*/
  }


  private transformDataFilter(value: any): any {
    let val;
    if (value === "ALL") {
      val = "ALL";
    } else if (value === "true") {
      val = true;
    } else {
      val = false;
    }
    return val
  }

  // with ngModelChange
  filterMember($event): void {
    this.appState$ = this.eventService.filter$(this.transformDataFilter($event), this.dataSubject.value)
      .pipe(
        map(response => {
          this.notifier.onSuccess(response.message);
          return {dataState: DataState.LOADED_STATE, appData: response}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.filterSubject.next('');
          this.notifier.onError(error);
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }


  deleteEvent(event: EventResponse): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete " + event.code + " ?",
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appState$ = this.eventService.delete$(event.idEvenement)
          .pipe(
            map(response => {
              this.notifier.onSuccess(response.message);
              this.dataSubject.next(
                {
                  ...response, datas:
                    {events: this.dataSubject.value.datas.events.filter(e => e.idEvenement !== event.idEvenement)}
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
    });

  }

  printReport(): void {
    //window.print();
    /*let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers');
    let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    let downloadLink = document.createElement('a');
    document.body.append(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);*/
  }


  public prepareCreateNewMember(): void {
    this.headerText = "Create New Event"
    this.crudMode = "Create";
    this.displayModal = true;
    this.eventRequest = this.initFormCreate();
    this.initEventForm(this.eventRequest);
  }

  public closeModal() {
    this.displayModal = false;
    this.eventRequest = this.initFormCreate();
    this.eventForm.reset(this.eventRequest)
  }


  setDataFromView(event: EventResponse) {
    this.eventRequest = this.fromResponseToRequest(event);
  }

  public prepareEditEvent(event: EventResponse): void {
    this.headerText = "Edit Event";
    this.crudMode = "Edit";
    this.setDataFromView(event)
    this.initEventForm(this.eventRequest);
    this.displayModal = true;
  }

  fromResponseToRequest(event: EventResponse): EventRequest {
    let value: EventRequest = {
      idEvenement: event.idEvenement,
      idRubrique: event.rubrique.idRubrique,
      idAnnee: event.annee.idAnnee,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      commentaire: event.commentaire
    };
    return value;
  }

  private initEventForm(eventRequest: EventRequest): void {
    this.eventForm = new FormGroup({
      idEvenement: new FormControl(eventRequest.idEvenement),
      idRubrique: new FormControl(eventRequest.idRubrique, Validators.required),
      idAnnee: new FormControl(eventRequest.idAnnee, Validators.required),
      dateDebut: new FormControl(eventRequest.dateDebut, Validators.required),
      dateFin: new FormControl(eventRequest.dateFin),
      commentaire: new FormControl(eventRequest.commentaire, [Validators.required]),
    });
  }

}
