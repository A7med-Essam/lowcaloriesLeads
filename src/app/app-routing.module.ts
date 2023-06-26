import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './components/error404/error404.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AccountingGuard } from './core/accounting.guard';
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
    canActivate: [AuthGuard,AccountingGuard],
  },
  {
    path: 'dislike',
    loadChildren: () =>
      import('./modules/dislike/dislike.module').then((m) => m.DislikeModule),
    canActivate: [AuthGuard,AccountingGuard],
  },
  {
    path: 'clinic',
    loadChildren: () =>
      import('./modules/clinic/clinic.module').then((m) => m.ClinicModule),
    canActivate: [AuthGuard,AccountingGuard],
  },
  {
    path: 'agent',
    loadChildren: () =>
      import('./modules/agent-target/agent-target.module').then((m) => m.AgentTargetModule),
    canActivate: [AuthGuard,AccountingGuard],
  },
  {
    path: 'complaints',
    loadChildren: () =>
      import('./modules/complaints/complaints.module').then((m) => m.ComplaintsModule),
    canActivate: [AuthGuard,AccountingGuard],
  },
  {
    path: 'refund',
    loadChildren: () =>
      import('./modules/refund/refund.module').then((m) => m.RefundModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'calls',
    loadChildren: () =>
      import('./modules/calls/calls.module').then((m) => m.CallsModule),
    canActivate: [AuthGuard,AccountingGuard],
  },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
