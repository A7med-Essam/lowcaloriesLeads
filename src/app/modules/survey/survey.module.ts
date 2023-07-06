import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurveyRoutingModule } from './survey-routing.module';
import { FilterDetailsComponent } from './filter-details/filter-details.component';
import { InsertSurveyAnswerComponent } from './insert-survey-answer/insert-survey-answer.component';
import { InsertSurveyQuestionComponent } from './insert-survey-question/insert-survey-question.component';
import { UpdateSurveyQuestionComponent } from './update-survey-question/update-survey-question.component';
import { UpdateSurveyAnswerComponent } from './update-survey-answer/update-survey-answer.component';
import { SurveyComponent } from './survey.component';
import { SurveyRecyclebinComponent } from './survey-recyclebin/survey-recyclebin.component';
import { SurveyDetailsComponent } from './survey-details/survey-details.component';

import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PaginatorModule } from 'primeng/paginator';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipsModule } from 'primeng/chips';
import { AccordionModule } from 'primeng/accordion';

const APP_PRIMENG_MODULE = [
  SharedModule,
  TableModule,
  DialogModule,
  BreadcrumbModule,
  ButtonModule,
  RippleModule,
  DropdownModule,
  PaginatorModule,
  StepsModule,
  CheckboxModule,
  InputTextModule,
  RadioButtonModule,
  CalendarModule,
  ConfirmDialogModule,
  FileUploadModule,
  ListboxModule,
  MultiSelectModule,
  ChipsModule,
  AccordionModule,
];

@NgModule({
  declarations: [
    FilterDetailsComponent,
    InsertSurveyAnswerComponent,
    InsertSurveyQuestionComponent,
    InsertSurveyQuestionComponent,
    SurveyDetailsComponent,
    SurveyRecyclebinComponent,
    SurveyComponent,
    UpdateSurveyAnswerComponent,
    UpdateSurveyQuestionComponent,
  ],
  imports: [
    CommonModule,
    SurveyRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    APP_PRIMENG_MODULE,
  ],
})
export class SurveyModule {}
