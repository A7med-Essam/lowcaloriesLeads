import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportStaticsRoutingModule } from './report-statics-routing.module';
import { ShowReportStaticsComponent } from './show-report-statics/show-report-statics.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FilterData } from './filter-data.pipe';

@NgModule({
  declarations: [ShowReportStaticsComponent, FilterData],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    DialogModule,
    TableModule,
    ReportStaticsRoutingModule,
  ],
})
export class ReportStaticsModule implements OnInit {
  ngOnInit(): void {}
}
