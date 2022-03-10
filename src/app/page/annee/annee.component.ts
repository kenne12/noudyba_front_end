import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationServiceService} from "../../service/notification.service.service";
import {VilleService} from "../../service/ville.service";
import {ConfirmationService} from "primeng/api";
import {catchError, map, startWith} from "rxjs/operators";
import {AnneeResponse} from "../../interface/annee.response";
import {AnneeService} from "../../service/annee.service";
import {AnneeRequest} from "../../interface/annee.request";
import {Status} from "../../enum/status.enum";
import {UtilService} from "../../service/util.service";

@Component({
  selector: 'app-annee',
  templateUrl: './annee.component.html',
  styleUrls: ['./annee.component.css']
})
export class AnneeComponent implements OnInit {

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
  anneeForm: FormGroup = new FormGroup({});

  anneeState: any[];
  clotureState: any[];


  selectedAnnees: AnneeResponse[] = [];

  anneeRequest: AnneeRequest = {
    idAnnee: null,
    nom: '',
    etat: true,
    code: '',
    dateDebut: this.utilService.transformDate(new Date()),
    dateFin: this.utilService.transformDate(new Date()),
    cloturee: false,
  };


  constructor(private anneeService: AnneeService,
              private notifier: NotificationServiceService,
              private villeService: VilleService,
              private confirmationService: ConfirmationService,
              private utilService: UtilService) {
    this.anneeState = [
      {label: 'Off', value: false},
      {label: 'On', value: true},
    ];

    this.clotureState = [
      {label: 'No', value: false},
      {label: 'Yes', value: true},
    ];

    this.anneeRequest = this.initFormCreate();
    this.initAnneeForm(this.anneeRequest);
  }


  ngOnInit(): void {
    this.appState$ = this.anneeService.annees$
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {annees: response.datas.annees.reverse()}}
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
    let anneeRequest: AnneeRequest = {
      idAnnee: null,
      nom: '',
      code: '',
      etat: true,
      cloturee: false,
      dateDebut: this.utilService.transformDate(new Date()),
      dateFin: this.utilService.transformDate(new Date())
    };
    return anneeRequest;
  }

  get f() {
    return this.anneeForm.controls;
  }


  saveAnnee(): void {

    if (this.anneeForm.invalid) {
      return
    }

    this.isLoading.next(true);
    if (this.crudMode === "Create") {

      this.appState$ = this.anneeService.save$(this.anneeForm.value as AnneeRequest)
        .pipe(
          map(response => {
            this.dataSubject.next(
              {...response, datas: {annees: [response.datas.annee, ...this.dataSubject.value.datas.annees]}}
            );
            this.isLoading.next(false);
            this.anneeRequest = this.initFormCreate();
            this.anneeForm.reset(this.anneeRequest)
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

      this.appState$ = this.anneeService.edit$(this.anneeForm.value.idAnnee, this.anneeForm.value as AnneeRequest)
        .pipe(
          map(response => {
            const index = this.dataSubject.value.datas.annees.findIndex(annee => annee.idAnnee === response.datas.annee?.idAnnee);
            this.dataSubject.value.datas.annees[index] = response.datas.annee;
            this.isLoading.next(false);
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.anneeRequest = this.initFormCreate();
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
  filterAnnee($event): void {
    this.appState$ = this.anneeService.filter$(this.transformDataFilter($event), this.dataSubject.value)
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


  deleteAnnee(annee: AnneeResponse): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete " + annee.nom + " ?",
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // this.products = this.products.filter(val => val.id !== product.id);
        // this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000});
        this.appState$ = this.anneeService.delete$(annee.idAnnee)
          .pipe(
            map(response => {
              this.notifier.onSuccess(response.message);
              this.dataSubject.next(
                {
                  ...response, datas:
                    {annees: this.dataSubject.value.datas.annees.filter(m => m.idAnnee !== annee.idAnnee)}
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


  public openCreateModalDialog(): void {
    this.headerText = "Create New Year"
    this.anneeRequest = this.initFormCreate();
    this.initAnneeForm(this.anneeRequest);
  }

  public prepareCreateNewMember(): void {
    this.headerText = "Create New Year"
    this.crudMode = "Create";
    this.displayModal = true;
    this.anneeRequest = this.initFormCreate();
    this.initAnneeForm(this.anneeRequest);
  }

  public closeModal() {
    this.displayModal = false;
    this.anneeRequest = this.initFormCreate();
    this.anneeForm.reset(this.anneeRequest)
  }


  setDataFromView(annee: AnneeResponse) {
    this.anneeRequest = this.fromResponseToRequest(annee);
  }

  public prepareEditAnnee(annee: AnneeResponse): void {
    this.headerText = "Edit Year";
    this.crudMode = "Edit";
    this.setDataFromView(annee)
    this.initAnneeForm(this.anneeRequest);
    this.displayModal = true;
  }

  fromResponseToRequest(annee: AnneeResponse): AnneeRequest {
    let value: AnneeRequest = {
      nom: annee.nom,
      code: annee.code,
      etat: annee.etat,
      cloturee: annee.cloturee,
      idAnnee: annee.idAnnee,
      dateDebut: annee.dateDebut,
      dateFin: annee.dateFin
    };
    return value;
  }

  private initAnneeForm(anneeRequest: AnneeRequest): void {
    this.anneeForm = new FormGroup({
      idAnnee: new FormControl(anneeRequest.idAnnee),
      nom: new FormControl(anneeRequest.nom, Validators.required),
      code: new FormControl(anneeRequest.code),
      dateDebut: new FormControl(anneeRequest.dateDebut, Validators.required),
      dateFin: new FormControl(anneeRequest.dateFin, Validators.required),
      etat: new FormControl(anneeRequest.etat),
      cloturee: new FormControl(anneeRequest.cloturee),
    });
  }

}
