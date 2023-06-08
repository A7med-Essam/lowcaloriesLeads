import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RefundRoutingModule } from './refund-routing.module';
import { ShowRefundComponent } from './show-refund/show-refund.component';
import { CreateRefundComponent } from './create-refund/create-refund.component';
import { DetailsRefundComponent } from './details-refund/details-refund.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
const APP_PRIMENG_MODULE = [
  DropdownModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
];

@NgModule({
  declarations: [
    ShowRefundComponent,
    CreateRefundComponent,
    DetailsRefundComponent
  ],
  imports: [
    CommonModule,
    RefundRoutingModule,
    APP_PRIMENG_MODULE,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RefundModule { }
