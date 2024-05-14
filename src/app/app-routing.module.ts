import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './components/error404/error404.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NodeTreeComponent } from './components/node-tree/node-tree.component';
import { PermissionGuard } from './core/permission.guard';
import { LogGuard } from './core/log.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'node', component: NodeTreeComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_home'],
    },
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
    canActivate: [PermissionGuard],
    data: {
      permission: [''],
    },
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./modules/reports/reports.module').then((m) => m.ReportsModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_AgentReport'],
    },
  },
  {
    path: 'notes',
    loadChildren: () =>
      import('./modules/notes/notes.module').then((m) => m.NotesModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_notes'],
    },
  },
  {
    path: 'leadControls',
    loadChildren: () =>
      import('./modules/survey/survey.module').then((m) => m.SurveyModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_inputs'],
    },
  },
  {
    path: 'leads',
    loadChildren: () =>
      import('./modules/leads/leads.module').then((m) => m.LeadsModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_leads'],
    },
  },
  {
    path: 'dislike',
    loadChildren: () =>
      import('./modules/dislike/dislike.module').then((m) => m.DislikeModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_dislike'],
    },
  },
  {
    path: 'clinic',
    loadChildren: () =>
      import('./modules/clinic/clinic.module').then((m) => m.ClinicModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_clinic'],
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
      permission: ['show_target'],
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
      permission: ['show_complaints'],
    },
  },
  {
    path: 'refund',
    loadChildren: () =>
      import('./modules/refund/refund.module').then((m) => m.RefundModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_refund'],
    },
  },
  {
    path: 'calls',
    loadChildren: () =>
      import('./modules/calls/calls.module').then((m) => m.CallsModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_calls'],
    },
  },
  {
    path: 'paymentlink',
    loadChildren: () =>
      import('./modules/payment/payment.module').then((m) => m.PaymentModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_paymentlink'],
    },
  },
  {
    path: 'paymentbranch',
    loadChildren: () =>
      import('./modules/payment/payment.module').then((m) => m.PaymentModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['createPayment_Branches'],
    },
  },
  {
    path: 'offer-settings',
    loadChildren: () =>
      import('./modules/payment/payment.module').then((m) => m.PaymentModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_offer'],
    },
  },
  {
    path: 'subscriptions',
    loadChildren: () =>
      import('./modules/subscriptions/subscriptions.module').then(
        (m) => m.SubscriptionsModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_subscription'],
    },
  },
  {
    path: 'analysis',
    loadChildren: () =>
      import('./modules/analysis/analysis.module').then(
        (m) => m.AnalysisModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_analysis'],
    },
  },
  {
    path: 'giftcode',
    loadChildren: () =>
      import('./modules/giftcode/giftcode.module').then(
        (m) => m.GiftcodeModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_giftcode'],
    },
  },
  {
    path: 'mailService',
    loadChildren: () =>
      import('./modules/mail-service/mail-service.module').then(
        (m) => m.MailServiceModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_mailService'],
    },
  },
  {
    path: 'reportStatics',
    loadChildren: () =>
      import('./modules/report-statics/report-statics.module').then(
        (m) => m.ReportStaticsModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_reportStaticService'],
    },
  },
  {
    path: 'queryModule',
    loadChildren: () =>
      import('./modules/query-module/query-module.module').then(
        (m) => m.QueryModuleModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_queryModuleService'],
    },
  },
  {
    path: 'logs',
    loadChildren: () =>
      import('./modules/log-activities/log-activities.module').then(
        (m) => m.LogActivitiesModule
      ),
    canActivate: [PermissionGuard,LogGuard],
    data: {
      permission: ['show_logs'],
    },
  },
  {
    path: 'bulk-whatsapp-messages',
    loadChildren: () =>
      import(
        './modules/bulk-whatsapp-message/bulk-whatsapp-message.module'
      ).then((m) => m.BulkWhatsappMessageModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['send_bulkWhatsapp'],
    },
  },

  {
    path: 'redirect',
    loadChildren: () =>
      import('./modules/redirect/redirect.module').then(
        (m) => m.RedirectModule
      ),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_redirect'],
    },
  },
  {
    path: 'upload',
    loadChildren: () =>
      import('./modules/upload/upload.module').then((m) => m.UploadModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_docs'],
    },
  },
  {
    path: 'enquiry',
    loadChildren: () =>
      import('./modules/enquiry/enquiry.module').then((m) => m.EnquiryModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_enquiry'],
    },
  },
  {
    path: 'items',
    loadChildren: () =>
      import('./modules/items/items.module').then((m) => m.ItemsModule),
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_items'],
    },
  },
  {
    path: 'customer-plan',
    loadChildren: () =>
      import('./modules/customer-plan/customer-plan.module').then(
        (m) => m.CustomerPlanModule
      ),
  },
  // {
  //   path: 'franchise',
  //   loadChildren: () =>
  //     import('./modules/franchise/franchise.module').then((m) => m.FranchiseModule),
  //   canActivate: [PermissionGuard],
  //   data: {
  //     permission: ['show_franchise'],
  //   },
  // },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
