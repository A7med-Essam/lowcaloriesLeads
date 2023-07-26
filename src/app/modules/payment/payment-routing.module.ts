import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreatePaymentlinkComponent } from './create-paymentlink/create-paymentlink.component';
import { PrintPaymentbranchComponent } from './print-paymentbranch/print-paymentbranch.component';

const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  {
    path: 'create',
    component: CreatePaymentlinkComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_paymentlink'],
    },
  },
  {
    path: 'print',
    component: PrintPaymentbranchComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['createPayment_Branches'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}
