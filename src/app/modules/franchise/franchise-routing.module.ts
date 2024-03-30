import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { FranchiseeComponent } from './franchisee/franchisee.component';
import { ContractsComponent } from './contracts/contracts.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: FranchiseeComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_franchise'],
    },
  },
  {
    path: 'contracts/:id',
    component: ContractsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_franchise'],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FranchiseRoutingModule { }
