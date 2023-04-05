import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from 'src/services/survey.service';
// import { LayersService } from 'src/app/shared/services/eg/dashboard/layers.service';
// import { AppService } from 'src/app/shared/services/app.service';
// import { SurveyService } from 'src/app/shared/services/eg/dashboard/survey.service';

@Component({
  selector: 'app-update-survey-question',
  templateUrl: './update-survey-question.component.html',
  styleUrls: ['./update-survey-question.component.scss'],
})
export class UpdateSurveyQuestionComponent implements OnInit {
  updateForm!: FormGroup;
  types: any[] = [
    {name:'Radio Button',value:'radio'},
    {name:'Checkbox',value:'check'},
    {name:'Text',value:'text'},
    {name:'Dropdown List',value:'drop'},
  ];
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getUpdateForm();
    this.showDetails();
  }
  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }
  update() {
    this._SurveyService.updateRow(this.updateForm.value).subscribe((res) => {
      this._Router.navigate(['leads'], {
        relativeTo: this._ActivatedRoute.parent?.parent,
      });
    });
  }

  showDetails() {
    this._SurveyService.surveyQuestionsId.subscribe((id) => {
      if (id) {
        let question_id: number = this.getFormData({
          id: id,
        }) as any;
        this._SurveyService.showRow(question_id).subscribe((res) => {
          this.getUpdateForm(res);
        });
      } else {
        this._Router.navigate(['leads'], {
          relativeTo: this._ActivatedRoute.parent?.parent,
        });
      }
    });
  }

  getUpdateForm(data?: any) {
    this.updateForm = new FormGroup({
      id: new FormControl(data?.data.id, [Validators.required]),
      question: new FormControl(data?.data.question, [Validators.required]),
      question_ar: new FormControl(data?.data.question_ar, [
        Validators.required,
      ]),
      type: new FormControl(data?.data.type, [Validators.required]),
    });
  }
  
}
