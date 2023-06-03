import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddTargetComponent } from './add-target/add-target.component';
import { ShowTargetComponent } from './show-target/show-target.component';
import { TargetDetailsComponent } from './target-details/target-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'create',
    component: AddTargetComponent,
  },
  {
    path: 'show',
    component: ShowTargetComponent,
  },
  {
    path: 'details',
    component: TargetDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentTargetRoutingModule { }
