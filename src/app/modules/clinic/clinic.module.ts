import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicRoutingModule } from './clinic-routing.module';
import { CreateClinicLinkComponent } from './create-clinic-link/create-clinic-link.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';


const APP_PRIMENG_MODULE = [
  // ButtonModule,
  DropdownModule,
  InputTextModule,
  // TableModule,
  // DialogModule,
  // CalendarModule,
  // MultiSelectModule,
  // ChipsModule,
];

@NgModule({
  declarations: [
    CreateClinicLinkComponent
  ],
  imports: [
    CommonModule,
    ClinicRoutingModule,
    APP_PRIMENG_MODULE,
    // FormsModule,
    ReactiveFormsModule
  ]
})
export class ClinicModule { }
