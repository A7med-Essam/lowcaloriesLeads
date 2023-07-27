import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-reasons',
  templateUrl: './show-reasons.component.html',
  styleUrls: ['./show-reasons.component.scss']
})
export class ShowReasonsComponent implements OnInit {
  reasons: any[] = [];
  constructor(
    private _SurveyService: SurveyService,
    private confirmationService: ConfirmationService

  ) {}

  ngOnInit(): void {
    this.getReasons();
  }

  deleteRow(id: number) {
    this._SurveyService.deleteLostReason(id).subscribe((res) => {
      this.getReasons();
    });
  }

  getReasons() {
    this._SurveyService.lostReasons().subscribe((res) => {
      this.reasons = res.data;
    });
  }

  confirm(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }

}
