import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreateAnalysisComponent } from './create-analysis/create-analysis.component';
import { ShowAnalysisComponent } from './show-analysis/show-analysis.component';
import { UpdateAnalysisComponent } from './update-analysis/update-analysis.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateAnalysisComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_analysis'],
    },
  },
  {
    path: 'show',
    component: ShowAnalysisComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_analysis'],
    },
  },
  {
    path: 'update',
    component: UpdateAnalysisComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['update_analysis'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalysisRoutingModule { }
