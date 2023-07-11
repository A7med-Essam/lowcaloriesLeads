import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { ShowUsersComponent } from './show-users/show-users.component';
import { UpdateUsersComponent } from './update-users/update-users.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TabViewModule } from "primeng/tabview";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { RolesComponent } from './roles/roles.component';
import { UpdateRoleComponent } from './update-role/update-role.component';
import { InputTextModule } from 'primeng/inputtext';

const APP_PRIMENG_MODULE = [
  TableModule,
  ButtonModule,
  TabViewModule,
  DialogModule,
  DropdownModule,
  InputTextModule
];

@NgModule({
  declarations: [
    ShowUsersComponent,
    UpdateUsersComponent,
    RolesComponent,
    UpdateRoleComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    APP_PRIMENG_MODULE,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
