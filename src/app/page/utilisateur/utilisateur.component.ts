import {Component, OnInit} from '@angular/core';
import {HttpEventType, HttpResponse} from "@angular/common/http";
import {UtilisateurResponse} from "../../interface/utilisateur.response";
import {UtilisateurService} from "../../service/utilisateur.service";
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UtilisateurRequest} from "../../interface/utilisateur.request";
import {BehaviorSubject, Observable, of} from "rxjs";
import {AppState} from "../../interface/app-state";
import {Status} from "../../enum/status.enum";
import {CustomResponse} from "../../interface/custom.response";
import {DataState} from "../../enum/data.state.enum";
import {catchError, map, startWith} from "rxjs/operators";
import {NotificationServiceService} from "../../service/notification.service.service";
import {Role} from "../../interface/role";
import {UtilService} from "../../service/util.service";

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent implements OnInit {

  appState$: Observable<AppState<CustomResponse>> | null = null;
  readonly DataSate = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  userRequest: UtilisateurRequest = {};
  selectedUser: UtilisateurResponse = {roles: []};
  selectedUsers: UtilisateurResponse[] = [];
  loading: boolean = true;

  public crudMode = "Create";
  public submitted: boolean = false;
  public userForm: FormGroup = new FormGroup({});
  public dialogTitle = '';

  items: MenuItem[] = [];

  public list_role_sources: Array<any> = new Array<any>();
  public list_role_targets: Array<any> = new Array<any>();

  public selectedFiles: any[] = [];
  public progress = 0;
  private currentTime: number = 0;

  constructor(private userService: UtilisateurService, private messageService: MessageService,
              private confirmationService: ConfirmationService, private utilService: UtilService,
              private utilisateurService: UtilisateurService,
              private notifier: NotificationServiceService) {
    this.initUserCreateForm(this.userRequest);
  }

  ngOnInit(): void {
    this.loadListUsers();
    this.initSpeedDial();
    this.loading = false;
  }

  private initUserCreateForm(userRequest: UtilisateurRequest): void {
    this.userForm = new FormGroup({
      idUtilisateur: new FormControl(userRequest.idUtilisateur),
      nom: new FormControl(userRequest.nom, Validators.required),
      prenom: new FormControl(userRequest.prenom, [Validators.required]),
      username: new FormControl(userRequest.username, Validators.required),
      password: new FormControl(userRequest.password, Validators.required),
      repeatPassword: new FormControl(userRequest.repeatPassword, Validators.required),
      actif: new FormControl(userRequest.actif),
    });

    this.userForm.controls['nom'].valueChanges.subscribe(value => {
      this.userRequest.nom = value;
    });
  }

  get f() {
    return this.userForm.controls;
  }

  loadListUsers(): void {
    this.appState$ = this.utilisateurService.utilisateur$
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.notifier.onSuccess(response.message);
          return {
            dataState: DataState.LOADED_STATE,
            appData: {...response, datas: {users: response.datas.users}}
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
    let user: UtilisateurRequest = {
      idUtilisateur: undefined,
      nom: '',
      prenom: '',
      actif: true,
      username: '',
      password: '',
      repeatPassword: ''
    };
    return user;
  }


  public onPrepareNewUser(): void {
    this.crudMode = "Create";
    this.dialogTitle = "New User Create Form";
    this.submitted = false;
    this.userRequest = this.initFormCreate();
    this.initUserCreateForm(this.userRequest);
    this.utilService.openModal('#user_create_modal');
  }

  public deleteSelectedUsers(): void {

  }

  public selectUser(user: UtilisateurResponse) {
    this.selectedUser = user;
  }

  public saveUser(): void {
    this.submitted = true;
    if (this.userForm.controls.password.value !== this.userForm.controls.repeatPassword.value) {
      this.messageService.add({
        severity: 'warning',
        summary: 'Information',
        detail: 'Veuillez saisir les mots de passe identiques'
      });
      return;
    }

    if (this.crudMode === 'Create') {
      this.appState$ = this.utilisateurService.save$(this.userForm.value as UtilisateurRequest)
        .pipe(
          map(response => {
            this.dataSubject.next(
              {...response, datas: {users: [response.datas.user, ...this.dataSubject.value.datas.users]}}
            );
            this.isLoading.next(false);
            this.userRequest = this.initFormCreate();
            this.userForm.reset(this.userRequest)
            this.notifier.onSuccess(response.message);
            // this.displayModal = false;
            this.utilService.closeModal('#user_create_modal');
            this.messageService.add({severity: 'success', summary: 'Information', detail: 'User Created With Success'});
            return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
          }),
          startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
          catchError((error: string) => {
            this.isLoading.next(false);
            this.notifier.onError(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Information',
              detail: 'Error Occured While Creating new User'
            });
            return of({dataState: DataState.ERROR_STATE, error: error})
          })
        );
    } else {
      this.utilisateurService.update(this.selectedUser.idUtilisateur, this.userForm.value).subscribe(data => {
        this.messageService.add({severity: 'success', summary: 'Information', detail: 'User Updated With Success'});
        this.utilService.closeModal('#user_create_modal');
        this.loadListUsers();
      }, err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Information',
          detail: 'Error Occured While Creating new User'
        });
      });
    }
  }

  public saveUserAcces(): void {
    this.isLoading.next(true);
    this.submitted = true;
    if (!this.list_role_targets) {
      this.messageService.add({
        severity: 'warning',
        summary: 'Information',
        detail: 'Please select user access in the right part of table'
      });
      this.isLoading.next(false);
      this.submitted = false;
      return;
    }

    this.appState$ = this.utilisateurService.add_roles_to_user$(this.selectedUser.username, this.list_role_targets)
      .pipe(
        map(response => {
          let index = this.dataSubject.value.datas.users
            .findIndex(user => user.idUtilisateur === response.datas.user?.idUtilisateur);
          this.dataSubject.value.datas.users[index] = response.datas.user;
          this.isLoading.next(false);
          this.notifier.onSuccess(response.message);

          this.messageService.add({
            severity: 'success',
            summary: 'Information',
            detail: 'User Access Saved With Success'
          });
          this.selectedUser = {};
          this.userRequest = {};
          this.utilService.closeModal('#user_manage_role_modal');
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.isLoading.next(false);
          this.notifier.onError(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Information',
            detail: 'Error Occured While Saving User Access'
          });
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  public removeUserAcces(): void {
    this.isLoading.next(true);
    if (!this.list_role_sources) {
      this.messageService.add({
        severity: 'warning',
        summary: 'Information',
        detail: 'Please select user access in the left part of table'
      });
      this.isLoading.next(false);
      return;
    }

    this.appState$ = this.utilisateurService.revoke_roles_to_user$(this.selectedUser.username, this.list_role_targets)
      .pipe(
        map(response => {
          let index = this.dataSubject.value.datas.users
            .findIndex(user => user.idUtilisateur === response.datas.user?.idUtilisateur);
          this.dataSubject.value.datas.users[index] = response.datas.user;
          this.isLoading.next(false);
          this.notifier.onSuccess(response.message);

          this.list_role_sources = [];
          this.list_role_targets = [];

          this.messageService.add({
            severity: 'success',
            summary: 'Information',
            detail: 'User Roles Revoked With Success'
          });
          this.selectedUser = {};
          this.userRequest = {};
          this.utilService.closeModal('#user_role_remove_modal');
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: string) => {
          this.isLoading.next(false);
          this.notifier.onError(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Information',
            detail: 'Error Occured While Revoking User Access'
          });
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  public editUser(userResponse: any): void {
    this.userRequest = this.userService.fromResponseToRequest(userResponse);
    this.initUserCreateForm(this.userRequest);
    this.dialogTitle = "User Edit Form";
    this.crudMode = "Edit";
    this.submitted = false;
    this.utilService.openModal('#user_create_modal');
  }

  public deleteUser(userResponse: UtilisateurResponse): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete user ' + userResponse.nom + '' + userResponse.prenom + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.delete(userResponse.idUtilisateur).subscribe(data => {
          this.messageService.add({severity: 'success', summary: 'Information', detail: 'User Delete With Success'});
          this.loadListUsers();
        }, err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Information',
            detail: 'Error Occured While Deleting Selected User'
          });
        });
      }
    });
  }

  initSpeedDial(): void {
    this.items = [
      {
        label: 'Refresh',
        icon: 'pi pi-refresh',
        command: () => {
          this.messageService.add({severity: 'success', summary: 'Update', detail: 'Data Updated'});
        }
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.editUser(this.selectedUser);
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.deleteUser(this.selectedUser);
        }
      },
      {
        label: 'Add User Access',
        icon: 'pi pi-key',
        command: () => {
          this.initUserAccessDetails();
          this.dialogTitle = 'User Right Add Management = > ' + this.selectedUser.nom + ' ' + this.selectedUser.prenom;
          this.utilService.openModal('#user_manage_role_modal');
        }
      },
      {
        label: 'Remove User Access',
        icon: 'pi pi-key',
        command: () => {
          this.initUserRemoveAccessDialog();
          this.dialogTitle = 'User Right Remove Management = > ' + this.selectedUser.nom + ' ' + this.selectedUser.prenom;
          this.utilService.openModal('#user_role_remove_modal');
        }
      },
      {
        label: 'Upload',
        icon: 'pi pi-upload',
        command: () => {
          this.showAndUploadImage();
        }
      },
    ];
  }

  private initUserAccessDetails(): void {
    this.list_role_targets = new Array<any>();
    this.list_role_sources = new Array<any>();
    let roles: Role[] = [];
    this.utilisateurService.getAbsentRolesByUsername(this.selectedUser.username).subscribe(data => {
      roles.push(...data.datas.roles);
      this.list_role_sources = this.utilService.fromRoleToString(data.datas.roles);
      this.list_role_targets = this.utilService.fromRoleToString(this.selectedUser.roles);
      console.log(this.list_role_sources.length);
    }, err => {
      console.log(err);
    });
  }

  private initUserRemoveAccessDialog(): void {
    this.list_role_targets = new Array<any>();
    this.list_role_sources = new Array<any>();
    this.list_role_targets = this.utilService.fromRoleToString(this.selectedUser.roles);
  }

  public showAndUploadImage(): void {
    this.dialogTitle = "Upload User Image => " + this.selectedUser.nom + ' ' + this.selectedUser.prenom;
    this.utilService.openModal('#user_upload_photo_modal');
  }

  public onSelectedFile(event: any) {
    this.selectedFiles = event.target.files;
  }

  public uploadPhoto(): void {
    this.progress = 0;

    this.utilService.uploadUserImage(this.selectedFiles[0], this.selectedUser.idUtilisateur).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        /*this.progress = Math.round(100 * event.loaded / event.total);*/
        this.messageService.add({
          severity: 'success',
          summary: 'information',
          detail: 'User image uploaded with success',
          life: 3000
        });

        this.utilService.closeModal("#user_upload_photo_modal");
        this.loadListUsers();
      } else if (event instanceof HttpResponse) {
        this.currentTime = Date.now();
      }
    }, err => {
      alert("Problème de chargement");
    });
    this.selectedFiles = [];
  }
}
