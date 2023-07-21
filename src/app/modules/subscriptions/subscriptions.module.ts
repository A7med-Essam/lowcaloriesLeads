import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionsRoutingModule } from './subscriptions-routing.module';
import { ShowSubscriptionComponent } from './show-subscription/show-subscription.component';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  declarations: [
    ShowSubscriptionComponent,
    SubscriptionDetailsComponent
  ],
  imports: [
    CommonModule,
    SubscriptionsRoutingModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    TagModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    CalendarModule
  ]
})
export class SubscriptionsModule { }
