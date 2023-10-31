import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RedirectRoutingModule } from './redirect-routing.module';
import { ShowRedirectComponent } from './show-redirect/show-redirect.component';
import { UpdateRedirectComponent } from './update-redirect/update-redirect.component';
import { CreateRedirectComponent } from './create-redirect/create-redirect.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ImageModule } from 'primeng/image';


const APP_PRIMENG_MODULE = [
  DropdownModule,
  InputTextareaModule,
  InputTextModule,
  TableModule,
  DialogModule,
  CalendarModule,
  CheckboxModule,
  ImageModule
];

@NgModule({
  declarations: [
    ShowRedirectComponent,
    UpdateRedirectComponent,
    CreateRedirectComponent
  ],
  imports: [
    CommonModule,
    RedirectRoutingModule,
    APP_PRIMENG_MODULE,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class RedirectModule { }
