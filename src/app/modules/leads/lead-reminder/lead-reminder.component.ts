import { Component, OnInit } from '@angular/core';
import { AnalysisService } from 'src/app/services/analysis.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-lead-reminder',
  templateUrl: './lead-reminder.component.html',
  styleUrls: ['./lead-reminder.component.scss'],
})
export class LeadReminderComponent implements OnInit {
  constructor(private _AnalysisService: AnalysisService) {}

  ngOnInit(): void {
    this.allReminder();
  }

  reminder: any[] = [];
  allReminder() {
    this._AnalysisService.allReminder().subscribe({
      next: (res) => {
        this.reminder = res.data
      },
    });
  }

  update(id:number){
    this._AnalysisService.updateReminder(id).subscribe({
      next: (res) => {
        this.allReminder();
      },
    });
  }

    // ===============================================================Details======================================================================
    currentRow: any;
    detailsModal:boolean = false;
    showRow(log: any) {
      this.currentRow = log;
      this.detailsModal = true;
    }

    getAnalyticsById(id:number){
      this._AnalysisService.getAnalyticsById(id).subscribe(res=>{
        this.showRow(res.data);
      })
    }
}
