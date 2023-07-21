import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './components/error404/error404.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { PermissionGuard } from './core/permission.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ["show_home"],
    },
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
    canActivate: [PermissionGuard],
    data: {
      permission: [""],
    },
  },
  {
    path: 'leadControls',
    loadChildren: () =>
      import('./modules/survey/survey.module').then((m) => m.SurveyModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_inputs"],
    },
  },
  {
    path: 'leads',
    loadChildren: () =>
      import('./modules/leads/leads.module').then((m) => m.LeadsModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_leads"],
    },
  },
  {
    path: 'dislike',
    loadChildren: () =>
      import('./modules/dislike/dislike.module').then((m) => m.DislikeModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_dislike"],
    },
  },
  {
    path: 'clinic',
    loadChildren: () =>
      import('./modules/clinic/clinic.module').then((m) => m.ClinicModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["create_clinic"],
    },
  },
  {
    path: 'target',
    loadChildren: () =>
      import('./modules/agent-target/agent-target.module').then(
        (m) => m.AgentTargetModule
      ),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_target"],
    },
  },
  {
    path: 'complaints',
    loadChildren: () =>
      import('./modules/complaints/complaints.module').then(
        (m) => m.ComplaintsModule
      ),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_complaints"],
    },
  },
  {
    path: 'refund',
    loadChildren: () =>
      import('./modules/refund/refund.module').then((m) => m.RefundModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_refund"],
    },
  },
  {
    path: 'calls',
    loadChildren: () =>
      import('./modules/calls/calls.module').then((m) => m.CallsModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_calls"],
    },
  },
  {
    path: 'paymentlink',
    loadChildren: () =>
      import('./modules/paymentlink/paymentlink.module').then((m) => m.PaymentlinkModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["create_paymentlink"],
    },
  },
  {
    path: 'subscriptions',
    loadChildren: () =>
      import('./modules/subscriptions/subscriptions.module').then((m) => m.SubscriptionsModule),
    canActivate: [PermissionGuard],
     data: {
      permission: ["show_subscription"],
    },
  },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
