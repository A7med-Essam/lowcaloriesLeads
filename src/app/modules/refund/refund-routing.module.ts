import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { AddReasonsComponent } from './add-reasons/add-reasons.component';
import { CreateRefundComponent } from './create-refund/create-refund.component';
import { DetailsRefundComponent } from './details-refund/details-refund.component';
import { ShowReasonsComponent } from './show-reasons/show-reasons.component';
import { ShowRefundComponent } from './show-refund/show-refund.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateRefundComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_refund'],
    },
  },
  {
    path: 'show',
    component: ShowRefundComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_refund'],
    },
  },
  {
    path: 'details',
    component: DetailsRefundComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_refund'],
    },
  },
  {
    path: 'reasons',
    component: ShowReasonsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['reasons_refund'],
    },
  },
  {
    path: 'add-reason',
    component: AddReasonsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['reasons_refund'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundRoutingModule {}
