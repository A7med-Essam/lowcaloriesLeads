import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FranchiseRoutingModule } from './franchise-routing.module';
import { FranchiseeComponent } from './franchisee/franchisee.component';
import { ContractsComponent } from './contracts/contracts.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    FranchiseeComponent,
    ContractsComponent
  ],
  imports: [
    CommonModule,
    FranchiseRoutingModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ReactiveFormsModule,
    CalendarModule,
    InputTextModule
  ]
})
export class FranchiseModule { }
