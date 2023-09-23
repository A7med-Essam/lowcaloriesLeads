import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MailServiceRoutingModule } from './mail-service-routing.module';
import { ShowHeadMailsComponent } from './show-head-mails/show-head-mails.component';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    ShowHeadMailsComponent
  ],
  imports: [
    CommonModule,
    MailServiceRoutingModule,
    TableModule,
    MultiSelectModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule
  ]
})
export class MailServiceModule { }
