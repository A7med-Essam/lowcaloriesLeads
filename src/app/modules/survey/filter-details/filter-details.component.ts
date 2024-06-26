import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-filter-details',
  templateUrl: './filter-details.component.html',
  styleUrls: ['./filter-details.component.scss'],
})
export class FilterDetailsComponent implements OnInit {
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
    this._SurveyService.filterId.subscribe((id) => {
      if (id) {
        let surveyId: number = this.getFormData({ id: id }) as any;
        this._SurveyService.showRowFiltered(surveyId).subscribe((res) => {
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

}
