import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ShowCustomerPlanComponent } from './show-customer-plan/show-customer-plan.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: ShowCustomerPlanComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_customerPlan'],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerPlanRoutingModule { }
