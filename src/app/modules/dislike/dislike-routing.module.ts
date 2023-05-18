import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminGuard } from 'src/app/core/super-admin.guard';
import { AddReasonsComponent } from './add-reasons/add-reasons.component';
import { DislikeDetailsComponent } from './dislike-details/dislike-details.component';
import { DislikeComponent } from './dislike/dislike.component';
import { ReasonsComponent } from './reasons/reasons.component';
import { ShowDislikeComponent } from './show-dislike/show-dislike.component';
import { UpdateDislikeComponent } from './update-dislike/update-dislike.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'update',
    component: UpdateDislikeComponent,
  },
  {
    path: 'create',
    component: DislikeComponent,
  },
  {
    path: 'show',
    component: ShowDislikeComponent,
  },
  {
    path: 'details',
    component: DislikeDetailsComponent,
  },
  {
    path: 'reasons',
    component: ReasonsComponent,
    canActivate: [SuperAdminGuard],
  },
  {
    path: 'add-reason',
    component: AddReasonsComponent,
    canActivate: [SuperAdminGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DislikeRoutingModule { }
