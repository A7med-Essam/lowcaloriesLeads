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
import { UpdateOfferComponent } from './offer-setting/update-offer/update-offer.component';
import { CreateOfferComponent } from './offer-setting/create-offer/create-offer.component';
import { ShowOfferComponent } from './offer-setting/show-offer/show-offer.component';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { RamadanMealTypesPipe } from 'src/app/core/pipes/ramadan-meal-types.pipe';
import { ColorPickerModule } from 'primeng/colorpicker';

@NgModule({
  declarations: [
    CreatePaymentlinkComponent,
    PrintPaymentbranchComponent,
    UpdateOfferComponent,
    CreateOfferComponent,
    ShowOfferComponent,
    RamadanMealTypesPipe
  ],
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
    TableModule,
    ConfirmDialogModule,
    TagModule,
    ColorPickerModule
  ],
})
export class PaymentModule {}
