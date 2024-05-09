import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ShowLogActivitiesComponent } from './show-log-activities/show-log-activities.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: ShowLogActivitiesComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['read_logs'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogActivitiesRoutingModule {}
