import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreateRedirectComponent } from './create-redirect/create-redirect.component';
import { ShowRedirectComponent } from './show-redirect/show-redirect.component';
import { UpdateRedirectComponent } from './update-redirect/update-redirect.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateRedirectComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_redirect'],
    },
  },
  {
    path: 'update',
    component: UpdateRedirectComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['update_redirect'],
    },
  },
  {
    path: 'show',
    component: ShowRedirectComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_redirect'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RedirectRoutingModule { }
