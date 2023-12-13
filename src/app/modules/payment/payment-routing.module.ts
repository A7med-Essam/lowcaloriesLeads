import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreatePaymentlinkComponent } from './create-paymentlink/create-paymentlink.component';
import { CreateOfferComponent } from './offer-setting/create-offer/create-offer.component';
import { ShowOfferComponent } from './offer-setting/show-offer/show-offer.component';
import { UpdateOfferComponent } from './offer-setting/update-offer/update-offer.component';
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
  {
    path: 'showOffer',
    component: ShowOfferComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_offer'],
    },
  },
  {
    path: 'updateOffer',
    component: UpdateOfferComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['update_offer'],
    },
  },
  {
    path: 'createOffer',
    component: CreateOfferComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_offer'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}
