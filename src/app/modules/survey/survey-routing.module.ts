import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from 'src/app/core/permission.guard';
import { FilterDetailsComponent } from './filter-details/filter-details.component';
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
      permission: ['show_inputLeads'],
    },
  },
  {
    path: 'details',
    component: SurveyDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['show_inputLeads'],
    },
  },
  // {
  //   path: 'filter-details',
  //   component: FilterDetailsComponent,
  //   canActivate: [PermissionGuard],
  //   data: {
  //     permission: ['show_inputLeads'],
  //   },
  // },
  {
    path: 'update-question',
    component: UpdateSurveyQuestionComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['updateQuestion_inputLeads'],
    },
  },
  {
    path: 'update-answer',
    component: UpdateSurveyAnswerComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['updateAnswer_inputLeads'],
    },
  },
  {
    path: 'insert-question',
    component: InsertSurveyQuestionComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['createQuestion_inputLeads'],
    },
  },
  {
    path: 'insert-answer',
    component: InsertSurveyAnswerComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['createAnswer_inputLeads'],
    },
  },
  {
    path: 'recycle-bin',
    component: SurveyRecyclebinComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: ['deleteQuestion_inputLeads'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyRoutingModule {}
