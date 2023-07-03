import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-survey-details',
  templateUrl: './survey-details.component.html',
  styleUrls: ['./survey-details.component.scss'],
})
export class SurveyDetailsComponent implements OnInit {
  survey: any;
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getDetails();
  }

  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }

  getDetails() {
    this._SurveyService.surveyQuestionsId.subscribe((id) => {
      if (id) {
        let surveyId: number = this.getFormData({ id: id }) as any;
        this._SurveyService.showRow(surveyId).subscribe((res) => {
          this.survey = res.data;
        });
      } else {
        this._Router.navigate(['show'], {
          relativeTo: this._ActivatedRoute.parent,
        });
      }
    });
  }

  goBack() {
    this._Router.navigate(['show'], {
      relativeTo: this._ActivatedRoute.parent,
    });
  }

  updateRow(answer: any) {
    this._SurveyService.surveyAnswers.next(answer);
    this._Router.navigate(['update-answer'], {
      relativeTo: this._ActivatedRoute.parent,
    });
  }

  deleteAnswers(surveyId: number, answerId: number) {
    this._SurveyService.surveyQuestionsId.next(surveyId);
    this._SurveyService.deleteAnswers(answerId).subscribe((res) => {
      this.getDetails();
    });
  }

}
