import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallsRoutingModule } from './calls-routing.module';
import { AssignCallComponent } from './assign-call/assign-call.component';
import { ShowCallsComponent } from './show-calls/show-calls.component';
import { AddCallComponent } from './add-call/add-call.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';


@NgModule({
  declarations: [
    AssignCallComponent,
    ShowCallsComponent,
    AddCallComponent
  ],
  imports: [
    CommonModule,
    CallsRoutingModule,
    TableModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    InputTextareaModule
  ]
})
export class CallsModule { }
