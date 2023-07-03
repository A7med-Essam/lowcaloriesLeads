import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ComplaintsDetailsComponent } from './complaints-details/complaints-details.component';
import { CreateComplaintsComponent } from './create-complaints/create-complaints.component';
import { ShowComplaintsComponent } from './show-complaints/show-complaints.component';

const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateComplaintsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_complaints'],
    },
  },
  {
    path: 'show',
    component: ShowComplaintsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_complaints'],
    },
  },
  {
    path: 'details',
    component: ComplaintsDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_complaints'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComplaintsRoutingModule {}
