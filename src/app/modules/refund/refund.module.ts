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
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { ImageModule } from 'primeng/image';
import { ShowReasonsComponent } from './show-reasons/show-reasons.component';
import { AddReasonsComponent } from './add-reasons/add-reasons.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const APP_PRIMENG_MODULE = [
  DropdownModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  InputTextareaModule,
  CheckboxModule,
  MultiSelectModule,ImageModule,
  ConfirmDialogModule
];

@NgModule({
  declarations: [
    ShowRefundComponent,
    CreateRefundComponent,
    DetailsRefundComponent,
    ShowReasonsComponent,
    AddReasonsComponent
  ],
  imports: [
    CommonModule,
    RefundRoutingModule,
    APP_PRIMENG_MODULE,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class RefundModule { }
