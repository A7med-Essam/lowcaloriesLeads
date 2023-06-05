import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './components/error404/error404.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './core/auth.guard';
import { SuperAdminGuard } from './core/super-admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/survey/survey.module').then((m) => m.SurveyModule),
    canActivate: [AuthGuard, SuperAdminGuard],
  },
  {
    path: 'leads',
    loadChildren: () =>
      import('./modules/leads/leads.module').then((m) => m.LeadsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'dislike',
    loadChildren: () =>
      import('./modules/dislike/dislike.module').then((m) => m.DislikeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'clinic',
    loadChildren: () =>
      import('./modules/clinic/clinic.module').then((m) => m.ClinicModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'agent',
    loadChildren: () =>
      import('./modules/agent-target/agent-target.module').then((m) => m.AgentTargetModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'complaints',
    loadChildren: () =>
      import('./modules/complaints/complaints.module').then((m) => m.ComplaintsModule),
    canActivate: [AuthGuard],
  },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
