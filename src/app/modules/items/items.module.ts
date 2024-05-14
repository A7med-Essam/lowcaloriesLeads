import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemsRoutingModule } from './items-routing.module';
import { ShowItemsComponent } from './show-items/show-items.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const APP_PRIMENG_MODULE = [
  DropdownModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  InputTextareaModule,
  CheckboxModule,
  MultiSelectModule,
  ImageModule,
  ConfirmDialogModule
];
@NgModule({
  declarations: [
    ShowItemsComponent
  ],
  imports: [
    CommonModule,
    ItemsRoutingModule,
    APP_PRIMENG_MODULE,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class ItemsModule { }
