import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendBulkWhatsappMessageComponent } from './send-bulk-whatsapp-message/send-bulk-whatsapp-message.component';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { WhatsappTemplatesComponent } from './whatsapp-templates/whatsapp-templates.component';
import { WhatsappQueryComponent } from './whatsapp-query/whatsapp-query.component';
import { WhatsappSenderComponent } from './whatsapp-sender/whatsapp-sender.component';
import { WhatsappSenderShowComponent } from './whatsapp-sender-show/whatsapp-sender-show.component';
import { ShowScheduleJobsComponent } from './show-schedule-jobs/show-schedule-jobs.component';
import { RecordsScheduleJobsComponent } from './records-schedule-jobs/records-schedule-jobs.component';

const routes: Routes = [
  { path: '', redirectTo: 'send', pathMatch: 'full' },
  {
    path: 'send',
    component: SendBulkWhatsappMessageComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['send_bulkWhatsapp'],
    },
  },
  {
    path: 'track',
    component: ShowScheduleJobsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['track_bulkWhatsapp'],
    },
  },
  {
    path: 'trackNumbers/:id',
    component: RecordsScheduleJobsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['track_bulkWhatsapp'],
    },
  },
  {
    path: 'templates',
    component: WhatsappTemplatesComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['template_bulkWhatsapp'],
    },
  },
  {
    path: 'query',
    component: WhatsappQueryComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['query_bulkWhatsapp'],
    },
  },
  {
    path: 'create-sender',
    component: WhatsappSenderComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['sender_bulkWhatsapp'],
    },
  },
  {
    path: 'whatsapp-sender',
    component: WhatsappSenderShowComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['sender_bulkWhatsapp'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkWhatsappMessageRoutingModule {}
