import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ShowSubscriptionComponent } from './show-subscription/show-subscription.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: ShowSubscriptionComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_subscription'],
    },
  },
  {
    path: 'details',
    component: SubscriptionDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_subscription'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionsRoutingModule { }
