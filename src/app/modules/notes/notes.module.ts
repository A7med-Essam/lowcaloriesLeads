import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotesRoutingModule } from './notes-routing.module';
import { ShowNotesComponent } from './show-notes/show-notes.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InquiryNoteComponent } from './inquiry-note/inquiry-note.component';

@NgModule({
  declarations: [ShowNotesComponent, InquiryNoteComponent],
  imports: [
    CommonModule,
    NotesRoutingModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    TableModule,
    CheckboxModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule
  ],
})
export class NotesModule {}
