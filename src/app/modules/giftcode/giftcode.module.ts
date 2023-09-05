import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GiftcodeRoutingModule } from './giftcode-routing.module';
import { CreateGiftcodeComponent } from './create-giftcode/create-giftcode.component';
import { ShowGiftcodeComponent } from './show-giftcode/show-giftcode.component';
import { UpdateGiftcodeComponent } from './update-giftcode/update-giftcode.component';
import { GiftcodeDetailsComponent } from './giftcode-details/giftcode-details.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';

const APP_PRIMENG_MODULE = [
  DropdownModule,
  InputTextareaModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  CheckboxModule,
  MultiSelectModule,
  TabViewModule
];

@NgModule({
  declarations: [
    CreateGiftcodeComponent,
    ShowGiftcodeComponent,
    UpdateGiftcodeComponent,
    GiftcodeDetailsComponent
  ],
  imports: [
    CommonModule,
    GiftcodeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    APP_PRIMENG_MODULE
  ]
})
export class GiftcodeModule { }
