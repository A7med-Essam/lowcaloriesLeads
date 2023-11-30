import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnquiryRoutingModule } from './enquiry-routing.module';
import { ShowEnquiryComponent } from './show-enquiry/show-enquiry.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { PaymentRoutingModule } from '../payment/payment-routing.module';


@NgModule({
  declarations: [
    ShowEnquiryComponent
  ],
  imports: [
    CommonModule,
    EnquiryRoutingModule,
    PaymentRoutingModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    ReactiveFormsModule,
    CheckboxModule,
    RadioButtonModule,
    DialogModule,
    InputTextareaModule,
  ]
})
export class EnquiryModule { }
