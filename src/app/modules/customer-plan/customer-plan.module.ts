import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerPlanRoutingModule } from './customer-plan-routing.module';
import { ShowCustomerPlanComponent } from './show-customer-plan/show-customer-plan.component';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    ShowCustomerPlanComponent
  ],
  imports: [
    CommonModule,
    CustomerPlanRoutingModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    TableModule,
    TagModule,
    CalendarModule,
    ButtonModule
  ]
})
export class CustomerPlanModule { }
