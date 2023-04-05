import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from 'src/services/survey.service';

@Component({
  selector: 'app-insert-survey-answer',
  templateUrl: './insert-survey-answer.component.html',
  styleUrls: ['./insert-survey-answer.component.scss'],
})
export class InsertSurveyAnswerComponent implements OnInit {
  insertForm!: FormGroup;
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getInsertForm();
    this.showDetails();
  }

  insertRow() {
    this._SurveyService.insertAnswer(this.insertForm.value).subscribe((res) => {
      this._Router.navigate(['leads'], {
        relativeTo: this._ActivatedRoute.parent?.parent,
      });
    });
  }

  showDetails() {
    this._SurveyService.surveyAnswers.subscribe((Answers) => {
      if (Answers) {
        this.getInsertForm(Answers);
      } else {
        this._Router.navigate(['leads'], {
          relativeTo: this._ActivatedRoute.parent?.parent,
        });
      }
    });
  }

  getInsertForm(Answers?: any) {
    this.insertForm = new FormGroup({
      question_id: new FormControl(Answers?.id, [Validators.required]),
      type_value: new FormControl(null, [Validators.required]),
      type_value_ar: new FormControl(null, [Validators.required]),
    });
  }

}
