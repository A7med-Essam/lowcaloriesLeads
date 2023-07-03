import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { ShowUsersComponent } from './show-users/show-users.component';
import { UpdateUsersComponent } from './update-users/update-users.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TabViewModule } from "primeng/tabview";

const APP_PRIMENG_MODULE = [
  TableModule,
  ButtonModule,
  TabViewModule
];

@NgModule({
  declarations: [
    ShowUsersComponent,
    UpdateUsersComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    APP_PRIMENG_MODULE,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
