import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateleadComponent } from './createlead/createlead.component';
import { LeadDetailsComponent } from './lead-details/lead-details.component';
import { LeadReminderComponent } from './lead-reminder/lead-reminder.component';
import { ShowLeadComponent } from './show-lead/show-lead.component';
import { AnswerLeadComponent } from './answer-lead/answer-lead.component';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreateLeadQuestionsComponent } from './create-lead-questions/create-lead-questions.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateleadComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_leads'],
    },
  },
  {
    path: 'show',
    component: ShowLeadComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_leads'],
    },
  },
  {
    path: 'details',
    component: LeadDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_leads'],
    },
  },
  {
    path: 'reminder',
    component: LeadReminderComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['reminder_leads'],
    },
  },
  {
    path: 'answer',
    component: AnswerLeadComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['answer_leads'],
    },
  },
  {
    path: 'update',
    component: CreateLeadQuestionsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['answer_leads'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadsRoutingModule {}
