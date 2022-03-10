import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {Status} from "../../enum/status.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {EventResponse} from "../../interface/event.response";
import {EventService} from "../../service/event.service";
import {NotificationServiceService} from "../../service/notification.service.service";
import {AnneeService} from "../../service/annee.service";
import {RubriqueService} from "../../service/rubrique.service";
import {ConfirmationService} from "primeng/api";
import {UtilService} from "../../service/util.service";
import {catchError, map, startWith} from "rxjs/operators";
import {SouscriptionService} from "../../service/souscription.service";
import {SubscriptionRequest} from "../../interface/subscription.request";
import {SubscriptionResponse} from "../../interface/subscription.response";
import {MembreResponse} from "../../interface/membre.response";
import {MembreService} from "../../service/membre.service";
import {LocalStorageService} from "ngx-webstorage";

@Component({
  selector: 'app-souscription',
  templateUrl: './souscription.component.html',
  styleUrls: ['./souscription.component.css']
})
export class SouscriptionComponent implements OnInit {

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
  subscriptionForm: FormGroup = new FormGroup({});

  memberState: any[];


  listMembres: MembreResponse[] = [];
  listEvents: EventResponse[] = [];

  selectedMember: MembreResponse = {}

  selectedSubscriptions: EventResponse[] = [];

  subscriptionRequest: SubscriptionRequest = {
    idSouscription: null,
  };
  private anneeId: number;


  constructor(private eventService: EventService,
              private souscriptionService: SouscriptionService,
              private notifier: NotificationServiceService,
              private anneeService: AnneeService,
              private rubriqueService: RubriqueService,
              private confirmationService: ConfirmationService,
              private utilService: UtilService,
              private membreService: MembreService,
              private localStorage: LocalStorageService) {

    this.anneeId = parseInt(this.localStorage.retrieve("id_annee"));
    this.listEvents = this.eventService.getAll(this.anneeId);
    this.listMembres = this.membreService.getAll(true);

    this.subscriptionRequest = this.initFormCreate();
    this.initEventForm(this.subscriptionRequest);


  }


  ngOnInit(): void {
    this.appState$ = this.souscriptionService.subscriptions_by_annee$(this.anneeId)
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {subscriptions: response.datas.subscriptions.reverse()}}
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
    let subscriptionRequest: SubscriptionRequest = {
      idSouscription: null,
      idEvenement: null,
      idMembre: null,
      montant: 1,
      dateSouscription: this.utilService.transformDate(new Date()),
      libelle: ''
    };
    return subscriptionRequest;
  }

  get f() {
    return this.subscriptionForm.controls;
  }


  saveSubscription(): void {

    if (this.subscriptionForm.invalid) {
      return
    }

    this.isLoading.next(true);
    if (this.crudMode === "Create") {

      this.appState$ = this.souscriptionService.save$(this.subscriptionForm.value as SubscriptionRequest)
        .pipe(
          map(response => {
            this.dataSubject.next(
              {
                ...response,
                datas: {subscriptions: [response.datas.subscription, ...this.dataSubject.value.datas.subscriptions]}
              }
            );
            this.isLoading.next(false);
            this.crudMode = "";
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.subscriptionRequest = this.initFormCreate();
            this.subscriptionForm.reset(this.subscriptionRequest);
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

      this.appState$ = this.souscriptionService.edit$(this.subscriptionForm.value.idSouscription, this.subscriptionForm.value as SubscriptionRequest)
        .pipe(
          map(response => {
            const index = this.dataSubject.value.datas.subscriptions.findIndex(subs => subs.idSouscription === response.datas.subscription.idSouscription);
            this.dataSubject.value.datas.subscriptions[index] = response.datas.subscription;
            this.isLoading.next(false);
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.crudMode = "";
            this.subscriptionRequest = this.initFormCreate();
            this.subscriptionForm.reset(this.subscriptionRequest);
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
    /*this.appState$ = this.souscriptionService.filter$(this.transformDataFilter($event), this.dataSubject.value)
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
      );*/
  }


  deleteSubscription(subscription: SubscriptionResponse): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete " + subscription.membre.nom + " ?",
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appState$ = this.souscriptionService.delete$(subscription.idSouscription)
          .pipe(
            map(response => {
              this.notifier.onSuccess(response.message);
              this.dataSubject.next(
                {
                  ...response, datas:
                    {subscriptions: this.dataSubject.value.datas.subscriptions.filter(s => s.idSouscription !== subscription.idSouscription)}
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

  }


  public prepareCreateNewMember(): void {
    this.headerText = "Create New Subscription"
    this.crudMode = "Create";
    this.displayModal = true;
    this.subscriptionRequest = this.initFormCreate();
    this.initEventForm(this.subscriptionRequest);
  }

  public closeModal() {
    this.displayModal = false;
    this.subscriptionRequest = this.initFormCreate();
    this.subscriptionForm.reset(this.subscriptionRequest)
  }


  setDataFromView(subscriptionResponse: SubscriptionResponse) {
    this.subscriptionRequest = this.fromResponseToRequest(subscriptionResponse);
  }

  public prepareEditSubscription(subscriptionResponse: SubscriptionResponse): void {
    this.selectedMember = subscriptionResponse.membre;
    this.headerText = "Edit Subscription";
    this.crudMode = "Edit";
    this.setDataFromView(subscriptionResponse)
    this.initEventForm(this.subscriptionRequest);
    this.displayModal = true;
  }

  fromResponseToRequest(subs: SubscriptionResponse): SubscriptionRequest {
    let value: SubscriptionRequest = {
      idSouscription: subs.idSouscription,
      idEvenement: subs.evenement.idEvenement,
      idMembre: subs.membre.idMembre,
      dateSouscription: this.utilService.transformDate(subs.dateSouscription),
      montant: subs.montant,
      libelle: subs.libelle
    };
    return value;
  }

  private initEventForm(subscription: SubscriptionRequest): void {
    this.subscriptionForm = new FormGroup({
      idSouscription: new FormControl(subscription.idSouscription),
      idEvenement: new FormControl(subscription.idEvenement, Validators.required),
      idMembre: new FormControl(subscription.idMembre, Validators.required),
      dateSouscription: new FormControl(subscription.dateSouscription, Validators.required),
      montant: new FormControl(subscription.montant, [Validators.required, Validators.min(1)]),
      libelle: new FormControl(subscription.libelle, [Validators.required])
    });


    if (this.crudMode == "Create" || this.crudMode == "Edit") {
      this.subscriptionForm.controls['idEvenement'].valueChanges.subscribe(value => {
        const index = this.listEvents.findIndex(evt => evt.idEvenement === parseInt(value));
        this.subscriptionForm.controls.libelle.setValue(this.listEvents[index]?.commentaire);
      });
    }
  }
}
