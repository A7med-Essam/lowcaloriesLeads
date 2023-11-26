import { Component, OnInit } from '@angular/core';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-lead-reminder',
  templateUrl: './lead-reminder.component.html',
  styleUrls: ['./lead-reminder.component.scss'],
})
export class LeadReminderComponent implements OnInit {
  constructor(private _SurveyService: SurveyService) {}

  ngOnInit(): void {
    this.allReminderLeads();
  }

  leads: any[] = [];
  allReminderLeads() {
    this._SurveyService.allReminderLeads().subscribe({
      next: (res) => {
        // res.data.forEach((data:any) => {
        //   if (data.reminded == true  && data.remind_data != null) {
        //     this.leads.push(data);
        //   }
        // });
        this.leads = res.data
      },
    });
  }

  update(id:number){
    this._SurveyService.updateReminder(id).subscribe({
      next: (res) => {
        this.allReminderLeads();
      },
    });
  }
}
