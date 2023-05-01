import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DislikeDetailsComponent } from './dislike-details/dislike-details.component';
import { DislikeComponent } from './dislike/dislike.component';
import { ShowDislikeComponent } from './show-dislike/show-dislike.component';
import { UpdateDislikeComponent } from './update-dislike/update-dislike.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'update',
    component: UpdateDislikeComponent,
    // canActivate: [SuperAdminGuard],
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
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DislikeRoutingModule { }
