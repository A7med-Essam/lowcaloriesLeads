import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminGuard } from 'src/app/core/super-admin.guard';
import { CreateLeadQuestionsComponent } from './create-lead-questions/create-lead-questions.component';
import { CreateleadComponent } from './createlead/createlead.component';
import { DislikeComponent } from '../dislike/dislike/dislike.component';
import { LeadDetailsComponent } from './lead-details/lead-details.component';
import { LeadReminderComponent } from './lead-reminder/lead-reminder.component';
import { ShowLeadComponent } from './show-lead/show-lead.component';
import { AnswerLeadComponent } from './answer-lead/answer-lead.component';

const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateleadComponent,
    canActivate: [SuperAdminGuard],
  },
  {
    path: 'show',
    component: ShowLeadComponent,
  },
  {
    path: 'details',
    component: LeadDetailsComponent,
  },
  {
    path: 'reminder',
    component: LeadReminderComponent,
  },
  {
    path: 'answer',
    component: AnswerLeadComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadsRoutingModule {}
