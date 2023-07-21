import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionsRoutingModule } from './subscriptions-routing.module';
import { ShowSubscriptionComponent } from './show-subscription/show-subscription.component';


@NgModule({
  declarations: [
    ShowSubscriptionComponent
  ],
  imports: [
    CommonModule,
    SubscriptionsRoutingModule
  ]
})
export class SubscriptionsModule { }
