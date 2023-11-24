import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { LogComponent } from './log/log.component';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';


@NgModule({
  declarations: [
    LogComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    TableModule,
    CheckboxModule
  ]
})
export class ReportsModule { }
