import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreateAnalysisComponent } from './create-analysis/create-analysis.component';
import { CreateAnalysis2Component } from './create-analysis2/create-analysis2.component';
import { ManageAnalysisComponent } from './manage-analysis/manage-analysis.component';
import { ShowAnalysisComponent } from './show-analysis/show-analysis.component';
import { ShowAnalysis2Component } from './show-analysis2/show-analysis2.component';
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
    path: 'createV2',
    component: CreateAnalysis2Component,
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
    path: 'showV2',
    component: ShowAnalysis2Component,
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
  {
    path: 'updateV2',
    component: UpdateAnalysisComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['update_analysis'],
    },
  },
  {
    path: 'manage',
    component: ManageAnalysisComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['manage_analysis'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalysisRoutingModule { }
