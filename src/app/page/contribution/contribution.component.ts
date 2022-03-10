import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {Status} from "../../enum/status.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MembreResponse} from "../../interface/membre.response";
import {PaymentRequest} from "../../interface/payment.request";
import {SouscriptionService} from "../../service/souscription.service";
import {NotificationServiceService} from "../../service/notification.service.service";
import {ConfirmationService} from "primeng/api";
import {UtilService} from "../../service/util.service";
import {MembreService} from "../../service/membre.service";
import {catchError, map, startWith} from "rxjs/operators";
import {ContributionService} from "../../service/contribution.service";
import {ContributionRequest} from "../../interface/contribution.request";
import {ContributionResponse} from "../../interface/contribution.response";
import {EventResponse} from "../../interface/event.response";
import {EventService} from "../../service/event.service";
import {LocalStorageService} from "ngx-webstorage";

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.css']
})
export class ContributionComponent implements OnInit {

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
  contributionForm: FormGroup = new FormGroup({});

  listMembres: MembreResponse[] = [];
  listEvents: EventResponse[] = [];

  selectedContributions: ContributionResponse[] = [];

  contributionRequest: ContributionRequest = {
    idContribution: null,
  };
  anneeId: number;

  constructor(
    private contributionService: ContributionService,
    private souscriptionService: SouscriptionService,
    private notifier: NotificationServiceService,
    private confirmationService: ConfirmationService,
    private utilService: UtilService,
    private membreService: MembreService,
    private evenementService: EventService,
    private localStorage: LocalStorageService) {

    this.contributionRequest = this.initFormCreate();
    this.initContributionForm(this.contributionRequest);

    this.anneeId = parseInt(this.localStorage.retrieve("id_annee"));

    this.listEvents = this.evenementService.getAll(this.anneeId);
    this.listMembres = this.membreService.getAll(true);
  }


  ngOnInit(): void {
    this.appState$ = this.contributionService.contributions_by_annee$(this.anneeId)
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {contributions: response.datas.contributions.reverse()}}
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
    let contributionRequest: ContributionRequest = {
      idContribution: null,
      idEvenement: null,
      idMembre: null,
      montant: 1,
      dateContribution: this.utilService.transformDate(new Date()),
    };
    return contributionRequest;
  }

  get f() {
    return this.contributionForm.controls;
  }


  saveContribution(): void {

    if (this.contributionForm.invalid) {
      return
    }

    this.isLoading.next(true);
    if (this.crudMode === "Create") {

      this.appState$ = this.contributionService.save$(this.contributionForm.value as ContributionRequest)
        .pipe(
          map(response => {
            this.dataSubject.next(
              {
                ...response,
                datas: {contributions: [response.datas.contribution, ...this.dataSubject.value.datas.contributions]}
              }
            );
            this.isLoading.next(false);
            this.crudMode = "";
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.contributionRequest = this.initFormCreate();
            this.contributionForm.reset(this.contributionRequest);
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

      this.appState$ = this.contributionService.edit$(this.contributionForm.value.idContribution,
        this.contributionForm.value as PaymentRequest)
        .pipe(
          map(response => {
            const index = this.dataSubject.value.datas.contributions
              .findIndex(item => item.idContribution === response.datas.contribution.idContribution);
            this.dataSubject.value.datas.contributions[index] = response.datas.contribution;
            this.isLoading.next(false);
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.crudMode = "";
            this.contributionRequest = this.initFormCreate();
            this.contributionForm.reset(this.contributionRequest);
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

  deleteContribution(contribution: ContributionResponse): void {
    this.confirmationService.confirm({
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
    });

  }

  printReport(): void {

  }


  public prepareCreateNewContribution(): void {
    this.headerText = "Create New Payment"
    this.crudMode = "Create";
    this.displayModal = true;
    this.contributionRequest = this.initFormCreate();
    this.initContributionForm(this.contributionRequest);
  }

  public closeModal() {
    this.displayModal = false;
    this.contributionRequest = this.initFormCreate();
    this.contributionForm.reset(this.contributionRequest)
  }


  setDataFromView(contribution: ContributionResponse) {
    this.contributionRequest = this.fromResponseToRequest(contribution);
  }

  public prepareEdit(paymentResponse: ContributionResponse): void {
    this.headerText = "Edit Payment";
    this.crudMode = "Edit";
    this.setDataFromView(paymentResponse)
    this.initContributionForm(this.contributionRequest);
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

  private initContributionForm(contribution: ContributionRequest): void {
    this.contributionForm = new FormGroup({
      idContribution: new FormControl(contribution.idContribution),
      idEvenement: new FormControl(contribution.idEvenement, [Validators.required]),
      idMembre: new FormControl(contribution.idMembre, [Validators.required]),
      dateContribution: new FormControl(contribution.dateContribution, Validators.required),
      montant: new FormControl(contribution.montant, [Validators.required, Validators.min(1)]),
    });


    /*if (this.crudMode == "Create" || this.crudMode == "Edit") {
      this.paymentForm.controls['idSouscription'].valueChanges.subscribe(value => {
        const index = this.listEvents.findIndex(evt => evt.idEvenement === parseInt(value));
        this.paymentForm.controls.libelle.setValue(this.listEvents[index]?.commentaire);
      });
    }*/
  }

}
