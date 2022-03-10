import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {MembreService} from "../../service/membre.service";
import {NotificationServiceService} from "../../service/notification.service.service";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {catchError, map, startWith} from "rxjs/operators";
import {MembreResponse} from "../../interface/membre.response";
import {MembreRequest} from "../../interface/membre.request";
import {FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {VilleService} from "../../service/ville.service";
import {Ville} from "../../interface/ville";
import {Status} from "../../enum/status.enum";
import {ConfirmationService, MessageService} from "primeng/api";
import {HttpEventType, HttpResponse} from "@angular/common/http";


@Component({
  selector: 'app-membre',
  templateUrl: './membre.component.html',

  styleUrls: ['./membre.component.css']
})
export class MembreComponent implements OnInit {

  appState$: Observable<AppState<CustomResponse>> | null = null;
  readonly DataSate = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  readonly imageUrl = "http://localhost:8050/api/v1/membre/image";
  displayModal: boolean;
  headerText: string = ""
  private crudMode = "";
  membreForm: FormGroup = new FormGroup({});

  memberState: any[];
  listVilles: Ville[] = [];

  selectedMembers: MembreResponse[] = [];

  membreRequest: MembreRequest = {
    nom: '',
    prenom: '',
    state: true,
    idVille: null,
    idMembre: null,
    contact: ''
  };

  imgageDialog: boolean = false;
  selectedFiles?: File [] = [];
  currentFile: any = File;
  private progress: number;


  constructor(private membreService: MembreService,
              private notifier: NotificationServiceService,
              private villeService: VilleService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {
    this.memberState = [
      {label: 'Off', value: false},
      {label: 'On', value: true},
    ];

    this.listVilles = this.villeService.findAll();
    this.initMembreForm(this.membreRequest);
  }


  ngOnInit(): void {
    this.appState$ = this.membreService.membres$
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {membres: response.datas.membres.reverse()}}
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
    let membreRequest: MembreRequest = {
      nom: '',
      prenom: '',
      state: true,
      idVille: null,
      idMembre: null,
      contact: '+237 '
    };
    return membreRequest;
  }

  get f() {
    return this.membreForm.controls;
  }

  saveMember_(memberForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.membreService.save$(memberForm.value as MembreRequest)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {...response, datas: {membres: [response.datas.membre, ...this.dataSubject.value.datas.membres]}}
          );
          document.getElementById('closeModal').click();
          this.isLoading.next(false);
          memberForm.resetForm({state: true});
          this.notifier.onSuccess(response.message);
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


  saveMember(): void {

    if (this.membreForm.invalid) {
      return
    }

    this.isLoading.next(true);
    if (this.crudMode === "Create") {

      this.appState$ = this.membreService.save$(this.membreForm.value as MembreRequest)
        .pipe(
          map(response => {
            this.dataSubject.next(
              {...response, datas: {membres: [response.datas.membre, ...this.dataSubject.value.datas.membres]}}
            );
            this.isLoading.next(false);
            this.membreRequest = this.initFormCreate();
            this.membreForm.reset(this.membreRequest)
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

      this.appState$ = this.membreService.edit$(this.membreForm.value.idMembre, this.membreForm.value as MembreRequest)
        .pipe(
          map(response => {
            const index = this.dataSubject.value.datas.membres.findIndex(membre => membre.idMembre === response.datas.membre?.idMembre);
            this.dataSubject.value.datas.membres[index] = response.datas.membre;
            this.isLoading.next(false);
            this.notifier.onSuccess(response.message);
            this.displayModal = false;
            this.membreRequest = this.initFormCreate();
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
    this.appState$ = this.membreService.filter$(this.transformDataFilter($event), this.dataSubject.value)
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


  deleteMember(membre: MembreResponse): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete " + membre.nom + " " + (membre.prenom ? membre.prenom : "") + " ?",
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // this.products = this.products.filter(val => val.id !== product.id);
        // this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000});
        this.appState$ = this.membreService.delete$(membre.idMembre)
          .pipe(
            map(response => {
              this.notifier.onSuccess(response.message);
              this.dataSubject.next(
                {
                  ...response, datas:
                    {membres: this.dataSubject.value.datas.membres.filter(m => m.idMembre !== membre.idMembre)}
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

  public openCreateModalDialog(): void {
    this.headerText = "Create New Member"
    this.membreRequest = {nom: '', prenom: '', state: true, idVille: null, idMembre: null, contact: ''};
    this.initMembreForm(this.membreRequest);
  }

  public prepareCreateNewMember(): void {
    this.headerText = "Create New Member"
    this.crudMode = "Create";
    this.displayModal = true;
    this.membreRequest = this.initFormCreate();
    this.initMembreForm(this.membreRequest);
  }

  public closeModal() {
    this.displayModal = false;
    this.membreRequest = this.initFormCreate();
    this.membreForm.reset(this.membreRequest)
  }


  setDataFromView(member: MembreResponse) {
    this.membreRequest = this.fromResponseToRequest(member);
  }

  public prepareEditMember(member: MembreResponse): void {
    this.headerText = "Edit Member";
    this.crudMode = "Edit";
    this.setDataFromView(member)
    this.initMembreForm(this.membreRequest);
    this.displayModal = true;
  }

  fromResponseToRequest(member: MembreResponse): MembreRequest {
    let value: MembreRequest = {
      nom: member.nom,
      prenom: member.prenom,
      state: member.state,
      idVille: member.ville.idVille,
      idMembre: member.idMembre,
      contact: member.contact
    };
    return value;
  }

  private initMembreForm(membreRequest: MembreRequest): void {
    this.membreForm = new FormGroup({
      idMembre: new FormControl(membreRequest.idMembre),
      nom: new FormControl(membreRequest.nom, Validators.required),
      prenom: new FormControl(membreRequest.prenom),
      contact: new FormControl(membreRequest.contact, Validators.required),
      state: new FormControl(membreRequest.state),
      idVille: new FormControl(membreRequest.idVille, [Validators.required]),
    });

    /*this.membreForm.controls['nom'].valueChanges.subscribe(value => {
      this.membreRequest.nom = value;
    });*/
  }

  prepareUpload(member: MembreResponse) {
    this.imgageDialog = true;
    this.membreRequest = this.fromResponseToRequest(member)
  }

  onUpload(event) {
    this.currentFile = event.files[0];
    this.selectedFiles.push(event.files[0])
  }


  upload(): void {
    if (this.selectedFiles) {
      this.isLoading.next(true);
      const formData: FormData = new FormData();
      formData.append('file', this.currentFile);

      this.progress = 0;
      this.membreService.upload(this.membreRequest.idMembre, this.currentFile)
        .subscribe((event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {

            const index = this.dataSubject.value.datas.membres.findIndex(membre => membre.idMembre === event.body.datas.membre?.idMembre);
            this.dataSubject.value.datas.membres[index] = event.body.datas.membre;
            this.isLoading.next(false);
            this.notifier.onSuccess(event.body.message);

            const appState: AppState<CustomResponse> = {
              dataState: DataState.LOADED_STATE,
              appData: this.dataSubject.value
            }

            this.appState$ = of(appState);
          }
        }, (error: string) => {
          this.isLoading.next(false);
          this.progress = 0;
          const appState: AppState<CustomResponse> = {
            dataState: DataState.ERROR_STATE,
            appData: this.dataSubject.value,
            error: error
          }
          this.appState$ = of(appState);
        })
      this.membreRequest = this.initFormCreate();
      this.imgageDialog = false;
      this.currentFile = File;
      this.selectedFiles = [];
    }
  }


}
