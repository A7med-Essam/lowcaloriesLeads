import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { SurveyService } from 'src/app/services/survey.service';
// import { AppService } from 'src/app/shared/services/app.service';
// import { SurveyService } from 'src/app/shared/services/eg/dashboard/survey.service';

@Component({
  selector: 'app-survey-recyclebin',
  templateUrl: './survey-recyclebin.component.html',
  styleUrls: ['./survey-recyclebin.component.scss'],
  providers: [ConfirmationService],
})
export class SurveyRecyclebinComponent implements OnInit {
  recycle: any[] = [];
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getRecycle();
  }
  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }
  getRecycle() {
    this._SurveyService.getRecycle().subscribe((res) => {
      this.recycle = res.data;
    });
  }

  restore(restoreId: any) {
    let id = this.getFormData({ id: restoreId }) as any;
    this._SurveyService.restore(id).subscribe((res) => {
      this.goBack();
    });
  }

  goBack() {
    this._Router.navigate(['leads'], {
      relativeTo: this._ActivatedRoute.parent?.parent,
    });
  }

  confirm(deleteId: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.forceDeleteRow(deleteId);
      },
    });
  }

  forceDeleteRow(deleteId: number) {
    let id = this.getFormData({ id: deleteId }) as any;
    this._SurveyService.forceDelete(id).subscribe((res) => {
      this.getRecycle();
    });
  }

 
}
