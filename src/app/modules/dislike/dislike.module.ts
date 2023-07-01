import { DislikeRoutingModule } from './dislike-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChipsModule } from 'primeng/chips';
import { ShowDislikeComponent } from './show-dislike/show-dislike.component';
import { UpdateDislikeComponent } from './update-dislike/update-dislike.component';
import { DislikeDetailsComponent } from './dislike-details/dislike-details.component';
import { DislikeComponent } from './dislike/dislike.component';
import { AddReasonsComponent } from './add-reasons/add-reasons.component';
import { ReasonsComponent } from './reasons/reasons.component';
import { ImageModule } from 'primeng/image';

const APP_PRIMENG_MODULE = [
  ButtonModule,
  DropdownModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  MultiSelectModule,
  ChipsModule,
  ConfirmDialogModule,
  CheckboxModule,ImageModule
];

@NgModule({
  declarations: [
    ShowDislikeComponent,
    DislikeComponent,
    UpdateDislikeComponent,
    DislikeDetailsComponent,
    AddReasonsComponent,
    ReasonsComponent,
  ],
  imports: [
    CommonModule,
    DislikeRoutingModule,
    APP_PRIMENG_MODULE,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DislikeModule {}
