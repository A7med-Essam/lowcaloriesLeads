import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShowQueryModuleComponent } from './show-query-module/show-query-module.component';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ExecuteQueryModuleComponent } from './execute-query-module/execute-query-module.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: ShowQueryModuleComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_queryModuleService'],
    },
  },
  {
    path: 'execute',
    component: ExecuteQueryModuleComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['execute_queryModuleService'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QueryModuleRoutingModule {}
