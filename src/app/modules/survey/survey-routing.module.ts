import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { InsertSurveyAnswerComponent } from './insert-survey-answer/insert-survey-answer.component';
import { InsertSurveyQuestionComponent } from './insert-survey-question/insert-survey-question.component';
import { SurveyDetailsComponent } from './survey-details/survey-details.component';
import { SurveyRecyclebinComponent } from './survey-recyclebin/survey-recyclebin.component';
import { SurveyComponent } from './survey.component';
import { UpdateSurveyAnswerComponent } from './update-survey-answer/update-survey-answer.component';
import { UpdateSurveyQuestionComponent } from './update-survey-question/update-survey-question.component';

const routes: Routes = [
  { path: '', redirectTo: 'show', pathMatch: 'full' },
  {
    path: 'show',
    component: SurveyComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_inputs'],
    },
  },
  {
    path: 'details',
    component: SurveyDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_inputs'],
    },
  },
  {
    path: 'update-question',
    component: UpdateSurveyQuestionComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['updateQuestion_inputs'],
    },
  },
  {
    path: 'update-answer',
    component: UpdateSurveyAnswerComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['updateAnswer_inputs'],
    },
  },
  {
    path: 'insert-question',
    component: InsertSurveyQuestionComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['createQuestion_inputs'],
    },
  },
  {
    path: 'insert-answer',
    component: InsertSurveyAnswerComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['createAnswer_inputs'],
    },
  },
  {
    path: 'recycle-bin',
    component: SurveyRecyclebinComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['deleteQuestion_inputs'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyRoutingModule {}
