import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { CreateClinicLinkComponent } from './create-clinic-link/create-clinic-link.component';

const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateClinicLinkComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['create_clinic'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClinicRoutingModule {}
