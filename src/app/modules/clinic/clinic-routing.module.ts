import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateClinicLinkComponent } from './create-clinic-link/create-clinic-link.component';

const routes: Routes = [
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  { path: 'create', component: CreateClinicLinkComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicRoutingModule { }
