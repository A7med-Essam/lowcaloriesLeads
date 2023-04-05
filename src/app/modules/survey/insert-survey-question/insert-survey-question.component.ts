import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from 'src/services/survey.service';

@Component({
  selector: 'app-insert-survey-question',
  templateUrl: './insert-survey-question.component.html',
  styleUrls: ['./insert-survey-question.component.scss'],
})
export class InsertSurveyQuestionComponent implements OnInit {
  insertForm!: FormGroup;
  types: any[] = [
    {name:'Radio Button',value:'radio'},
    {name:'Checkbox',value:'check'},
    {name:'Text',value:'text'},
    {name:'Dropdown List',value:'drop'},
  ];
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getInsertForm();
  }

  insertRow() {
    this._SurveyService.insertRow(this.insertForm.value).subscribe((res) => {
      this._Router.navigate(['leads'], {
        relativeTo: this._ActivatedRoute.parent?.parent,
      });
    });
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      question: new FormControl(null, [Validators.required]),
      question_ar: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
    });
  }

 
}
