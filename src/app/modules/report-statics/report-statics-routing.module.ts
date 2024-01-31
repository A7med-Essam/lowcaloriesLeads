import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ShowReportStaticsComponent } from './show-report-statics/show-report-statics.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: ShowReportStaticsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_reportStaticService'],
    },
  },
  // {
  //   path: 'show/:id',
  //   component: MailDetailsComponent,
  //   canActivate: [PermissionGuard],
  //   data: {
  //     permission: ['show_reportStaticService'],
  //   },
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportStaticsRoutingModule {}
