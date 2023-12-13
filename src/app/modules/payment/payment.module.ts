import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { CreatePaymentlinkComponent } from './create-paymentlink/create-paymentlink.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrintPaymentbranchComponent } from './print-paymentbranch/print-paymentbranch.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OfferSettingComponent } from './offer-setting/offer-setting.component';

@NgModule({
  declarations: [CreatePaymentlinkComponent, PrintPaymentbranchComponent, OfferSettingComponent],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    ReactiveFormsModule,
    CheckboxModule,
    RadioButtonModule,
    DialogModule,
    InputTextareaModule,
  ],
})
export class PaymentModule {}
