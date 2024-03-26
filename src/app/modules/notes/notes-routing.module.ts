import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShowNotesComponent } from './show-notes/show-notes.component';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { InquiryNoteComponent } from './inquiry-note/inquiry-note.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: ShowNotesComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_notes'],
    },
  },
  {
    path: 'inquiry',
    component: InquiryNoteComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['showInquiry_notes'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotesRoutingModule {}
