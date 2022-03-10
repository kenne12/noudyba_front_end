import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {Status} from "../../enum/status.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MembreResponse} from "../../interface/membre.response";
import {SouscriptionService} from "../../service/souscription.service";
import {NotificationServiceService} from "../../service/notification.service.service";
import {ConfirmationService} from "primeng/api";
import {UtilService} from "../../service/util.service";
import {MembreService} from "../../service/membre.service";
import {catchError, map, startWith} from "rxjs/operators";
import {SubscriptionResponse} from "../../interface/subscription.response";
import {PaymentResponse} from "../../interface/payment.response";
import {PayementService} from "../../service/payement.service";
import {PaymentRequest} from "../../interface/payment.request";
import {LocalStorageService} from "ngx-webstorage";

@Component({
  selector: 'app-payement',
  templateUrl: './payement.component.html',
  styleUrls: ['./payement.component.css']
})
export class PayementComponent implements OnInit {

  appState$: Observable<AppState<CustomResponse>> | null = null;
  readonly DataSate = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  private subscriptionSubject = new BehaviorSubject<SubscriptionResponse []>([]);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  displayModal: boolean;
  headerText: string = ""
  private crudMode = "";
  paymentForm: FormGroup = new FormGroup({});

  listMembres: MembreResponse[] = [];
  listSouscriptions: SubscriptionResponse[] = [];

  selectedPayments: PaymentResponse[] = [];

  paymentRequest: PaymentRequest = {
    idPayementSouscription: null,
  };

  idMember: number = 0;
  montantPaye: number = 0;
  montantRestant: number = 0;
  private anneeId: number;


  constructor(
    private paymentService: PayementService,
    private souscriptionService: SouscriptionService,
    private notifier: NotificationServiceService,
    private confirmationService: ConfirmationService,
    private utilService: UtilService,
    private membreService: MembreService,
    private localStorage: LocalStorageService) {

    this.paymentRequest = this.initFormCreate();
    this.initPaymentForm(this.paymentRequest);

    this.anneeId = parseInt(this.localStorage.retrieve("id_annee"));

    this.listSouscriptions = this.souscriptionService.getNotPaidByAnneeId(this.anneeId);
    this.subscriptionSubject.next(this.listSouscriptions);
    this.listMembres = this.membreService.getAll(true);
  }


  ngOnInit(): void {
    this.appState$ = this.paymentService.payments_by_annee$(this.anneeId)
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {payments: response.datas.payments.reverse()}}
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
    let paymentRequest: PaymentRequest = {
      idPayementSouscription: null,
      idSouscription: null,
      montant: 1,
      datePayement: this.utilService.transformDate(new Date()),
    };
    return paymentRequest;
  }

  get f() {
    return this.paymentForm.controls;
  }

  private updateListSubscription(paymentResponse: PaymentResponse) {
    let list = this.subscriptionSubject.value;
    let index = list
      .findIndex(item => item.idSouscription == paymentResponse.souscription.idSouscription);
    if ((paymentResponse.souscription.montant - paymentResponse.souscription.montantPaye) > 0) {
      list[index] = paymentResponse.souscription;
    } else {
      list.splice(index, 1);
    }
    this.subscriptionSubject.next(list);
  }

  savePayment(): void {

    if (this.paymentForm.invalid) {
      return
    }

    this.isLoading.next(true);
    if (this.crudMode === "Create") {

      this.appState$ = this.paymentService.save$(this.paymentForm.value as PaymentRequest)
        .pipe(
          map(response => {
            this.updateListSubscription(response.datas.payment);
            this.dataSubject.next(
              {
                ...response,
                datas: {payments: [response.datas.payment, ...this.dataSubject.value.datas.payments]}
              }
            );
            this.isLoading.next(false);
            this.crudMode = "";
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.paymentRequest = this.initFormCreate();
            this.paymentForm.reset(this.paymentRequest);
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

      this.appState$ = this.paymentService.edit$(this.paymentForm.value.idSouscription,
        this.paymentForm.value as PaymentRequest)
        .pipe(
          map(response => {
            const index = this.dataSubject.value.datas.payments
              .findIndex(pay => pay.idPayementSouscription === response.datas.payment.idPayementSouscription);
            this.dataSubject.value.datas.payments[index] = response.datas.payment;
            this.isLoading.next(false);
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.crudMode = "";
            this.paymentRequest = this.initFormCreate();
            this.paymentForm.reset(this.paymentRequest);
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

  private updateAfterDelete(payment: PaymentResponse) {
    let list = this.subscriptionSubject.value;
    let index = list.findIndex(item => item.idSouscription === payment.souscription.idSouscription);
    if (index === null) {
      list.push(...list, payment.souscription);
    } else {
      let objectAtIndex = list[index];
      objectAtIndex.montantPaye -= payment.montant;
      list[index] = objectAtIndex;
    }
    this.subscriptionSubject.next(list);
  }

  deletePayment(payment: PaymentResponse): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete " + payment.souscription.libelle + " ?",
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appState$ = this.paymentService.delete$(payment.idPayementSouscription)
          .pipe(
            map(response => {
              this.notifier.onSuccess(response.message);
              this.dataSubject.next(
                {
                  ...response, datas:
                    {payments: this.dataSubject.value.datas.payments.filter(p => p.idPayementSouscription !== payment.idPayementSouscription)}
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
        this.updateAfterDelete(payment);
      }
    });

  }

  printReport(): void {

  }


  public prepareCreateNewPayment(): void {
    this.montantPaye = 0;
    this.montantRestant = 0;
    this.idMember = null;
    this.headerText = "Create New Payment"
    this.crudMode = "Create";
    this.displayModal = true;
    this.paymentRequest = this.initFormCreate();
    this.initPaymentForm(this.paymentRequest);
    this.listSouscriptions = this.subscriptionSubject.value;
  }

  public closeModal() {
    this.displayModal = false;
    this.paymentRequest = this.initFormCreate();
    this.paymentForm.reset(this.paymentRequest)
  }


  setDataFromView(paymentResponse: PaymentResponse) {
    this.paymentRequest = this.fromResponseToRequest(paymentResponse);
  }

  public prepareEditPayment(paymentResponse: PaymentResponse): void {
    this.headerText = "Edit Payment";
    this.crudMode = "Edit";
    this.idMember = paymentResponse.souscription.membre.idMembre;
    this.setDataFromView(paymentResponse)
    this.initPaymentForm(this.paymentRequest);
    this.displayModal = true;
  }

  fromResponseToRequest(payment: PaymentResponse): PaymentRequest {
    let value: PaymentRequest = {
      idPayementSouscription: payment.idPayementSouscription,
      idSouscription: payment.souscription.idSouscription,
      datePayement: this.utilService.transformDate(payment.datePayement),
      montant: payment.montant,
    };
    return value;
  }

  private initPaymentForm(payment: PaymentRequest): void {
    this.paymentForm = new FormGroup({
      idPayementSouscription: new FormControl(payment.idPayementSouscription),
      idSouscription: new FormControl(payment.idSouscription, [Validators.required]),
      datePayement: new FormControl(payment.datePayement, Validators.required),
      montant: new FormControl(payment.montant, [Validators.required, Validators.min(1)]),
    });


    /*if (this.crudMode == "Create" || this.crudMode == "Edit") {
      this.paymentForm.controls['idSouscription'].valueChanges.subscribe(value => {
        const index = this.listEvents.findIndex(evt => evt.idEvenement === parseInt(value));
        this.paymentForm.controls.libelle.setValue(this.listEvents[index]?.commentaire);
      });
    }*/
  }

  filterSubscription($event: any) {
    this.montantPaye = 0;
    this.montantRestant = 0;
    let list = this.subscriptionSubject.value.filter(item => item.membre.idMembre == parseInt($event))
    this.listSouscriptions = [];
    this.listSouscriptions.push(...list);
  }

  updateConnexData($event: any) {
    let index = this.listSouscriptions.findIndex(item => item.idSouscription == parseInt($event));
    this.montantPaye = this.listSouscriptions[index].montantPaye;
    this.montantRestant = (this.listSouscriptions[index].montant - this.montantPaye);
  }

  checkIfEditable(payment: PaymentResponse): boolean {
    return (payment.souscription.montant === payment.souscription.montantPaye)
  }
}
