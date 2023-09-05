import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreateGiftcodeComponent } from './create-giftcode/create-giftcode.component';
import { GiftcodeDetailsComponent } from './giftcode-details/giftcode-details.component';
import { ShowGiftcodeComponent } from './show-giftcode/show-giftcode.component';
import { UpdateGiftcodeComponent } from './update-giftcode/update-giftcode.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateGiftcodeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_giftcode'],
    },
  },
  {
    path: 'update',
    component: UpdateGiftcodeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['update_giftcode'],
    },
  },
  {
    path: 'show',
    component: ShowGiftcodeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_giftcode'],
    },
  },
  {
    path: 'details',
    component: GiftcodeDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_giftcode'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GiftcodeRoutingModule { }
