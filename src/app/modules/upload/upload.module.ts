import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadRoutingModule } from './upload-routing.module';
import { ShowUploadComponent } from './show-upload/show-upload.component';
import { CreateUploadComponent } from './create-upload/create-upload.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

const APP_PRIMENG_MODULE = [
  TableModule,
  DialogModule,
  ConfirmDialogModule,
  InputTextModule,
];

@NgModule({
  declarations: [ShowUploadComponent, CreateUploadComponent],
  imports: [
    CommonModule,
    UploadRoutingModule,
    APP_PRIMENG_MODULE,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class UploadModule {}
