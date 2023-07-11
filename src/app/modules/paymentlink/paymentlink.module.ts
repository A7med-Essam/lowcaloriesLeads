import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentlinkRoutingModule } from './paymentlink-routing.module';
import { CreatePaymentlinkComponent } from './create-paymentlink/create-paymentlink.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrintPaymentlinkComponent } from './print-paymentlink/print-paymentlink.component';


@NgModule({
  declarations: [
    CreatePaymentlinkComponent,
    PrintPaymentlinkComponent
  ],
  imports: [
    CommonModule,
    PaymentlinkRoutingModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    ReactiveFormsModule,
    CheckboxModule,
    RadioButtonModule
  ]
})
export class PaymentlinkModule { }
