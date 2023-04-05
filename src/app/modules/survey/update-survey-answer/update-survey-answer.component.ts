import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from 'src/services/survey.service';
// import { LayersService } from 'src/app/shared/services/eg/dashboard/layers.service';
// import { AppService } from 'src/app/shared/services/app.service';
// import { SurveyService } from 'src/app/shared/services/eg/dashboard/survey.service';

@Component({
  selector: 'app-update-survey-answer',
  templateUrl: './update-survey-answer.component.html',
  styleUrls: ['./update-survey-answer.component.scss'],
})
export class UpdateSurveyAnswerComponent implements OnInit {
  updateForm!: FormGroup;

  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getUpdateForm();
    this.showDetails();
  }

  update() {
    this._SurveyService.updateAnswer(this.updateForm.value).subscribe((res) => {
      this._Router.navigate(['details'], {
        relativeTo: this._ActivatedRoute.parent,
      });
    });
  }

  showDetails() {
    this._SurveyService.surveyAnswers.subscribe((Answers) => {
      if (Answers) {
        this.getUpdateForm(Answers);
      } else {
        this._Router.navigate(['leads'], {
          relativeTo: this._ActivatedRoute.parent?.parent,
        });
      }
    });
  }

  getUpdateForm(Answers?: any) {
    this.updateForm = new FormGroup({
      lead_answer_id: new FormControl(Answers?.id, [Validators.required]),
      type_value: new FormControl(Answers?.type_value, [Validators.required]),
      type_value_ar: new FormControl(Answers?.type_value_ar, [
        Validators.required,
      ]),
    });
  }

}
