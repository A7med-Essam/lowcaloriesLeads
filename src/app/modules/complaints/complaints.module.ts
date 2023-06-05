import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComplaintsRoutingModule } from './complaints-routing.module';
import { ShowComplaintsComponent } from './show-complaints/show-complaints.component';
import { CreateComplaintsComponent } from './create-complaints/create-complaints.component';
import { ComplaintsDetailsComponent } from './complaints-details/complaints-details.component';
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
    ShowComplaintsComponent,
    CreateComplaintsComponent,
    ComplaintsDetailsComponent,
  ],
  imports: [
    CommonModule,
    ComplaintsRoutingModule,
    APP_PRIMENG_MODULE,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ComplaintsModule { }
