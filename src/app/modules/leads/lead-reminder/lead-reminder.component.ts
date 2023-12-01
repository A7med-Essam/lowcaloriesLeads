import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalysisService } from 'src/app/services/analysis.service';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-lead-reminder',
  templateUrl: './lead-reminder.component.html',
  styleUrls: ['./lead-reminder.component.scss'],
})
export class LeadReminderComponent implements OnInit {
  constructor(
    private _AnalysisService: AnalysisService,
    private _LocalService: LocalService,
    private _Router: Router
  ) {}
  current_user: any;
  ngOnInit(): void {
    this.allReminder();
    this.current_user = this._LocalService.getJsonValue(
      'userInfo_oldLowCalories'
    );
  }

  reminder: any[] = [];
  allReminder() {
    this._AnalysisService.allReminder().subscribe({
      next: (res) => {
        res.data.forEach((data: any) => {
          if (
            new Date(data.reminder_date).toLocaleDateString() ==
            new Date().toLocaleDateString()
          ) {
            this.reminder.push(data);
          }
        });
      },
    });
  }

  update(id: number) {
    this._AnalysisService.updateReminder(id).subscribe({
      next: (res) => {
        this.allReminder();
      },
    });
  }

  // ===============================================================Details======================================================================
  currentRow: any;
  detailsModal: boolean = false;
  showRow(log: any) {
    this.currentRow = log;
    this.detailsModal = true;
  }

  getAnalyticsById(id: number) {
    this._AnalysisService.getAnalyticsById(id).subscribe((res) => {
      this.showRow(res.data);
    });
  }
  // ===============================================================Update======================================================================

  updateRow(row: any) {
    this._AnalysisService.analysis.next(row);
    this._Router.navigate(['analysis/update']);
  }

  updateNote(row: any) {
    row.note = this.updateNote;
    this._AnalysisService.updateAnalytics(row).subscribe((res) => {
      this.allReminder();
    });
  }

  updatedNote: string = '';
}
