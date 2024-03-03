import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendBulkWhatsappMessageComponent } from './send-bulk-whatsapp-message/send-bulk-whatsapp-message.component';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { WhatsappTemplatesComponent } from './whatsapp-templates/whatsapp-templates.component';
import { WhatsappQueryComponent } from './whatsapp-query/whatsapp-query.component';

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
    path: 'templates',
    component: WhatsappTemplatesComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['send_bulkWhatsapp'],
    },
  },
  {
    path: 'query',
    component: WhatsappQueryComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['send_bulkWhatsapp'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkWhatsappMessageRoutingModule {}
