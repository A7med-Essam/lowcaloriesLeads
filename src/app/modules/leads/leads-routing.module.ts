import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminGuard } from 'src/app/core/super-admin.guard';
import { CreateleadComponent } from './createlead/createlead.component';
import { LeadDetailsComponent } from './lead-details/lead-details.component';
import { LeadReminderComponent } from './lead-reminder/lead-reminder.component';
import { ShowLeadComponent } from './show-lead/show-lead.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadsRoutingModule {}
