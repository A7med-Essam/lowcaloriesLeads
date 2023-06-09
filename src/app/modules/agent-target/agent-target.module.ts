import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentTargetRoutingModule } from './agent-target-routing.module';
import { ShowTargetComponent } from './show-target/show-target.component';
import { TargetDetailsComponent } from './target-details/target-details.component';
import { AddTargetComponent } from './add-target/add-target.component';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

const APP_PRIMENG_MODULE = [
  // ButtonModule,
  CheckboxModule,
  // CardModule,
  DropdownModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  // MultiSelectModule,
  // ChipsModule,
];

@NgModule({
  declarations: [
    ShowTargetComponent,
    TargetDetailsComponent,
    AddTargetComponent
  ],
  imports: [
    CommonModule,
    AgentTargetRoutingModule,
    APP_PRIMENG_MODULE,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AgentTargetModule { }
