import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { AddTargetComponent } from './add-target/add-target.component';
import { FixTargetComponent } from './fix-target/fix-target.component';
import { ShowTargetComponent } from './show-target/show-target.component';
import { TargetDetailsComponent } from './target-details/target-details.component';
import { UpdateTargetComponent } from './update-target/update-target.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: AddTargetComponent,
    canActivate: [PermissionGuard],
    data: {
     permission: ["create_target"],
   },
  },
  {
    path: 'show',
    component: ShowTargetComponent,
      canActivate: [PermissionGuard],
     data: {
      permission: ["show_target"],
    },
  },
  {
    path: 'details',
    component: TargetDetailsComponent,
      canActivate: [PermissionGuard],
     data: {
      permission: ["show_target"],
    },
  },
  {
    path: 'update',
    component: UpdateTargetComponent,
      canActivate: [PermissionGuard],
     data: {
      permission: ["update_target"],
    },
  },
  {
    path: 'fix',
    component: FixTargetComponent,
      canActivate: [PermissionGuard],
     data: {
      permission: ["fix_target"],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentTargetRoutingModule { }
