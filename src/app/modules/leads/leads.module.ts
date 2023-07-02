import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadsRoutingModule } from './leads-routing.module';
import { CreateleadComponent } from './createlead/createlead.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShowLeadComponent } from './show-lead/show-lead.component';
import { LeadDetailsComponent } from './lead-details/lead-details.component';
import { LeadReminderComponent } from './lead-reminder/lead-reminder.component';
import { CreateLeadQuestionsComponent } from './create-lead-questions/create-lead-questions.component';
import { ChipsModule } from 'primeng/chips';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AnswerLeadComponent } from './answer-lead/answer-lead.component';
import { StepsModule } from 'primeng/steps';
import { RadioButtonModule } from 'primeng/radiobutton';
const APP_PRIMENG_MODULE = [
  ButtonModule,
  CheckboxModule,
  CardModule,
  DropdownModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  MultiSelectModule,
  ChipsModule,
  InputTextareaModule,
  StepsModule,
  RadioButtonModule,
];

@NgModule({
  declarations: [
    CreateleadComponent,
    ShowLeadComponent,
    LeadDetailsComponent,
    LeadReminderComponent,
    CreateLeadQuestionsComponent,
    AnswerLeadComponent,
  ],
  imports: [
    CommonModule,
    LeadsRoutingModule,
    APP_PRIMENG_MODULE,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class LeadsModule {}
