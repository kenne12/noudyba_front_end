import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MembreComponent} from "./page/membre/membre.component";
import {TemplateComponent} from "./template/template/template.component";
import {AnneeComponent} from "./page/annee/annee.component";
import {EventComponent} from "./page/event/event.component";
import {SouscriptionComponent} from "./page/souscription/souscription.component";
import {PayementComponent} from "./page/payement/payement.component";
import {ContributionComponent} from "./page/contribution/contribution.component";
import {LoginComponent} from './page/login/login.component';
import {AuthGuardService} from "./filter/auth.guard.service";
import {DashboardComponent} from "./page/dashboard/dashboard.component";
import {UtilisateurComponent} from "./page/utilisateur/utilisateur.component";
import {CalendrierComponent} from "./page/calendrier/calendrier.component";

const routes: Routes = [
  {
    path: '', component: TemplateComponent, children: [
      {path: 'membres', component: MembreComponent, canActivate: [AuthGuardService]},
      {path: 'annees', component: AnneeComponent, canActivate: [AuthGuardService]},
      {path: 'events', component: EventComponent, canActivate: [AuthGuardService]},
      {path: 'subscriptions', component: SouscriptionComponent, canActivate: [AuthGuardService]},
      {path: 'payments', component: PayementComponent, canActivate: [AuthGuardService]},
      {path: 'contributions', component: ContributionComponent, canActivate: [AuthGuardService]},
      {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService]},
      {path: 'utilisateurs', component: UtilisateurComponent, canActivate: [AuthGuardService]},
      {path: 'calendrier', component: CalendrierComponent, canActivate: [AuthGuardService]},
    ]
  },
  {path: "login", component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
