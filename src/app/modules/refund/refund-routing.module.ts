import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRefundComponent } from './create-refund/create-refund.component';
import { DetailsRefundComponent } from './details-refund/details-refund.component';
import { ShowRefundComponent } from './show-refund/show-refund.component';

const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateRefundComponent,
  },
  {
    path: 'show',
    component: ShowRefundComponent,
  },
  {
    path: 'details',
    component: DetailsRefundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefundRoutingModule { }
