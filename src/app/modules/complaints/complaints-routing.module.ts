import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComplaintsDetailsComponent } from './complaints-details/complaints-details.component';
import { CreateComplaintsComponent } from './create-complaints/create-complaints.component';
import { ShowComplaintsComponent } from './show-complaints/show-complaints.component';

const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateComplaintsComponent,
  },
  {
    path: 'show',
    component: ShowComplaintsComponent,
  },
  {
    path: 'details',
    component: ComplaintsDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComplaintsRoutingModule { }
