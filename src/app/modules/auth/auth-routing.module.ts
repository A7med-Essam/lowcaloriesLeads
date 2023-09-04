import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { AddUserComponent } from './add-user/add-user.component';
import { RolesComponent } from './roles/roles.component';
import { ShowUsersComponent } from './show-users/show-users.component';
import { UpdateRoleComponent } from './update-role/update-role.component';
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
  {
    path: 'roles',
    component: RolesComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: [""],
    },
  },
  {
    path: 'update-role',
    component: UpdateRoleComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: [""],
    },
  },
  {
    path: 'add',
    component: AddUserComponent,
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