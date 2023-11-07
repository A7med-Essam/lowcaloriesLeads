import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreateUploadComponent } from './create-upload/create-upload.component';
import { ShowUploadComponent } from './show-upload/show-upload.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateUploadComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_docs'],
    },
  },
  {
    path: 'show',
    component: ShowUploadComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_docs'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadRoutingModule { }
