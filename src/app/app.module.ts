import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NotificationModule} from "./notification.module";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {MembreComponent} from './page/membre/membre.component';
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SelectButtonModule} from "primeng/selectbutton";
import {TemplateComponent} from './template/template/template.component';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {FileUploadModule} from "primeng/fileupload";
import {AnneeComponent} from './page/annee/annee.component';
import {DatePipe} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {EventComponent} from './page/event/event.component';
import {SouscriptionComponent} from './page/souscription/souscription.component';
import {PayementComponent} from './page/payement/payement.component';
import {ContributionComponent} from './page/contribution/contribution.component';
import {DropdownModule} from 'primeng/dropdown';
import {LoginComponent} from './page/login/login.component';
import {NgxWebstorageModule} from "ngx-webstorage";
import {TokenInterceptorService} from "./filter/token.interceptor.service";
import {DashboardComponent} from './page/dashboard/dashboard.component';
import {CalendrierComponent} from './page/calendrier/calendrier.component';
import {UtilisateurComponent} from './page/utilisateur/utilisateur.component';
import {MultiSelectModule} from "primeng/multiselect";
import {ChartModule} from "primeng/chart";
import {AppConfigService} from "./config/app.config.service";


@NgModule({
  declarations: [
    AppComponent,
    MembreComponent,
    TemplateComponent,
    AnneeComponent,
    EventComponent,
    SouscriptionComponent,
    PayementComponent,
    ContributionComponent,
    LoginComponent,
    CalendrierComponent,
    UtilisateurComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NotificationModule,
    DialogModule,
    ButtonModule,
    SelectButtonModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    DialogModule,
    TableModule,
    ToastModule,
    FileUploadModule,
    CalendarModule,
    DropdownModule,
    NgxWebstorageModule.forRoot(),
    MultiSelectModule,
    ChartModule
  ],
  providers: [DatePipe, MessageService, ConfirmationService, AppConfigService, {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptorService,
    multi: true,
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
