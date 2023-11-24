import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { LogComponent } from './log/log.component';

const routes: Routes = [
  { path: '', redirectTo: 'details', pathMatch: 'full' },
  {
    path: 'details',
    component: LogComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: [''],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
