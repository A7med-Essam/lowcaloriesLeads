import { DislikeRoutingModule } from './dislike-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ChipsModule } from 'primeng/chips';
import { ShowDislikeComponent } from './show-dislike/show-dislike.component';
import { UpdateDislikeComponent } from './update-dislike/update-dislike.component';
import { DislikeDetailsComponent } from './dislike-details/dislike-details.component';
import { DislikeComponent } from './dislike/dislike.component';
const APP_PRIMENG_MODULE = [
  ButtonModule,
  DropdownModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  MultiSelectModule,
  ChipsModule,
];

@NgModule({
  declarations: [
    ShowDislikeComponent,
    DislikeComponent,
    UpdateDislikeComponent,
    DislikeDetailsComponent,
  ],
  imports: [
    CommonModule,
    DislikeRoutingModule,
    APP_PRIMENG_MODULE,
    FormsModule,
  ],
})
export class DislikeModule {}
