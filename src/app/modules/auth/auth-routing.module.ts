import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ShowUsersComponent } from './show-users/show-users.component';
import { UpdateUsersComponent } from './update-users/update-users.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'update',
    component: UpdateUsersComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: [""],
    },
  },
  {
    path: 'show',
    component: ShowUsersComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: [""],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}