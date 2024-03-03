import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QueryModuleRoutingModule } from './query-module-routing.module';
import { ShowQueryModuleComponent } from './show-query-module/show-query-module.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { HighlightWordsStartingWithDollarPipe } from './highlight.pipe';
import { ExecuteQueryModuleComponent } from './execute-query-module/execute-query-module.component';

@NgModule({
  declarations: [
    ShowQueryModuleComponent,
    HighlightWordsStartingWithDollarPipe,
    ExecuteQueryModuleComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QueryModuleRoutingModule,
    CalendarModule,
    PaginatorModule,
    ButtonModule,
    TableModule,
    InputTextareaModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
  ],
})
export class QueryModuleModule {}
