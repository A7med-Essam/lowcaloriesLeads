import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilterDetailsComponent } from './filter-details/filter-details.component';
import { InsertSurveyAnswerComponent } from './insert-survey-answer/insert-survey-answer.component';
import { InsertSurveyQuestionComponent } from './insert-survey-question/insert-survey-question.component';
import { SurveyDetailsComponent } from './survey-details/survey-details.component';
import { SurveyRecyclebinComponent } from './survey-recyclebin/survey-recyclebin.component';
import { SurveyComponent } from './survey.component';
import { UpdateSurveyAnswerComponent } from './update-survey-answer/update-survey-answer.component';
import { UpdateSurveyQuestionComponent } from './update-survey-question/update-survey-question.component';

const routes: Routes = [
  { path: '', redirectTo: 'leads', pathMatch: 'full' },
  {
    path: 'leads',
    children: [
      { path: '', component: SurveyComponent },
      {
        path: 'details',
        component: SurveyDetailsComponent,
      },
      {
        path: 'filter-details',
        component: FilterDetailsComponent,
      },
      {
        path: 'update-question',
        component: UpdateSurveyQuestionComponent,
      },
      {
        path: 'update-answer',
        component: UpdateSurveyAnswerComponent,
      },
      {
        path: 'insert-question',
        component: InsertSurveyQuestionComponent,
      },
      {
        path: 'insert-answer',
        component: InsertSurveyAnswerComponent,
      },
      {
        path: 'recycle-bin',
        component: SurveyRecyclebinComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveyRoutingModule { }
