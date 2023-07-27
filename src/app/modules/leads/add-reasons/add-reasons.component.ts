import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-add-reasons',
  templateUrl: './add-reasons.component.html',
  styleUrls: ['./add-reasons.component.scss']
})
export class AddReasonsComponent implements OnInit {

  selectedReason: string = '';
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
  ) {}

  ngOnInit(): void {}

  addReason(reason: string) {
    if (reason != '') {
      this._SurveyService.addLostReasons(reason).subscribe({
        next: (res) => {
          this._Router.navigate(['../leads/reasons']);
        },
      });
    }
  }

}
