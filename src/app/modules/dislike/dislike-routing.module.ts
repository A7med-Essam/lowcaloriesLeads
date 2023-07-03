import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { AddReasonsComponent } from './add-reasons/add-reasons.component';
import { DislikeDetailsComponent } from './dislike-details/dislike-details.component';
import { DislikeComponent } from './dislike/dislike.component';
import { ReasonsComponent } from './reasons/reasons.component';
import { ShowDislikeComponent } from './show-dislike/show-dislike.component';
import { UpdateDislikeComponent } from './update-dislike/update-dislike.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'update',
    component: UpdateDislikeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['update_dislike'],
    },
  },
  {
    path: 'create',
    component: DislikeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_dislike'],
    },
  },
  {
    path: 'show',
    component: ShowDislikeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_dislike'],
    },
  },
  {
    path: 'details',
    component: DislikeDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_dislike'],
    },
  },
  {
    path: 'reasons',
    component: ReasonsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['showDislike_reasons'],
    },
  },
  {
    path: 'add-reason',
    component: AddReasonsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['createDislike_reasons'],
    },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DislikeRoutingModule {}
