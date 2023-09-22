import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { ShowHeadMailsComponent } from './show-head-mails/show-head-mails.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: ShowHeadMailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_mailService'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MailServiceRoutingModule { }
