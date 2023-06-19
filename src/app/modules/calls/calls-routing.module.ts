import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminGuard } from 'src/app/core/super-admin.guard';
import { AddCallComponent } from './add-call/add-call.component';
import { AssignCallComponent } from './assign-call/assign-call.component';
import { ShowCallsComponent } from './show-calls/show-calls.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: AddCallComponent,
  },
  {
    path: 'show',
    component: ShowCallsComponent,
  },
  {
    path: 'assign',
    component: AssignCallComponent,
    canActivate: [SuperAdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallsRoutingModule { }
