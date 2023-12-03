import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalysisRoutingModule } from './analysis-routing.module';
import { CreateAnalysisComponent } from './create-analysis/create-analysis.component';
import { ShowAnalysisComponent } from './show-analysis/show-analysis.component';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { UpdateAnalysisComponent } from './update-analysis/update-analysis.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ManageAnalysisComponent } from './manage-analysis/manage-analysis.component';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TreeTableModule } from 'primeng/treetable';
import { CreateAnalysis2Component } from './create-analysis2/create-analysis2.component';
import { ShowAnalysis2Component } from './show-analysis2/show-analysis2.component';


@NgModule({
  declarations: [
    CreateAnalysisComponent,
    ShowAnalysisComponent,
    UpdateAnalysisComponent,
    ManageAnalysisComponent,
    CreateAnalysis2Component,
    ShowAnalysis2Component
  ],
  imports: [
    CommonModule,
    AnalysisRoutingModule,
    CalendarModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    MultiSelectModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    FormsModule,
    ConfirmDialogModule,
    ButtonModule,
    BreadcrumbModule,
    TreeTableModule
  ]
})
export class AnalysisModule { }
