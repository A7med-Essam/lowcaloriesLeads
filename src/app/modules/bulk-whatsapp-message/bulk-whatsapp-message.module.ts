import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BulkWhatsappMessageRoutingModule } from './bulk-whatsapp-message-routing.module';
import { SendBulkWhatsappMessageComponent } from './send-bulk-whatsapp-message/send-bulk-whatsapp-message.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { WhatsappTemplatesComponent } from './whatsapp-templates/whatsapp-templates.component';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { WhatsappQueryComponent } from './whatsapp-query/whatsapp-query.component';
import { HighlightWordsStartingWithDollarPipe } from './highlight.pipe';
import { PaginatorModule } from 'primeng/paginator';
import { WhatsappSenderComponent } from './whatsapp-sender/whatsapp-sender.component';
import { WhatsappSenderShowComponent } from './whatsapp-sender-show/whatsapp-sender-show.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { ShowScheduleJobsComponent } from './show-schedule-jobs/show-schedule-jobs.component';
import { RecordsScheduleJobsComponent } from './records-schedule-jobs/records-schedule-jobs.component';
import { TooltipModule } from 'primeng/tooltip';
import { CronComponent } from './cron/cron.component';

@NgModule({
  declarations: [
    SendBulkWhatsappMessageComponent,
    WhatsappTemplatesComponent,
    WhatsappQueryComponent,
    HighlightWordsStartingWithDollarPipe,
    WhatsappSenderComponent,
    WhatsappSenderShowComponent,
    ShowScheduleJobsComponent,
    RecordsScheduleJobsComponent,
    CronComponent,
  ],
  imports: [
    CommonModule,
    TooltipModule,
    ReactiveFormsModule,
    CalendarModule,
    PaginatorModule,
    ButtonModule,
    TableModule,
    InputTextareaModule,
    BulkWhatsappMessageRoutingModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    MultiSelectModule,
  ],
})
export class BulkWhatsappMessageModule {}
