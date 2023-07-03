import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { AddCallComponent } from './add-call/add-call.component';
import { AssignCallComponent } from './assign-call/assign-call.component';
import { CallDetailsComponent } from './call-details/call-details.component';
import { ShowCallsComponent } from './show-calls/show-calls.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: AddCallComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_calls'],
    },
  },
  {
    path: 'show',
    component: ShowCallsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_calls'],
    },
  },
  {
    path: 'details',
    component: CallDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_calls'],
    },
  },
  {
    path: 'assign',
    component: AssignCallComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['assign_calls'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallsRoutingModule {}
