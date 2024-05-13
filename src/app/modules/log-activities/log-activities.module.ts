import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogActivitiesRoutingModule } from './log-activities-routing.module';
import { ShowLogActivitiesComponent } from './show-log-activities/show-log-activities.component';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ShowLogActivitiesComponent],
  imports: [
    CommonModule,
    LogActivitiesRoutingModule,
    DropdownModule,
    InputTextareaModule,
    InputTextModule,
    TableModule,
    DialogModule,
    CalendarModule,
    CheckboxModule,
    MultiSelectModule,
    TabViewModule,
    ReactiveFormsModule
  ],
})
export class LogActivitiesModule {}
