import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';
import { GuardService } from 'src/app/services/guard.service';
import { LocalService } from 'src/app/services/local.service';
import { SurveyService } from 'src/app/services/survey.service';
@Component({
  selector: 'app-analysis-reminder',
  templateUrl: './analysis-reminder.component.html',
  styleUrls: ['./analysis-reminder.component.scss'],
})
export class AnalysisReminderComponent implements OnInit, OnDestroy {
  constructor(
    private _AnalysisService: AnalysisService,
    private _LocalService: LocalService,
    private _Router: Router,
    private _GuardService: GuardService,
    private _SurveyService: SurveyService,
    private _MessageService: MessageService
  ) {}
  current_user: any;
  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngOnInit(): void {
    this._AnalysisService.filtered_Reminder
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.appliedFilters = res;
        }
      });
    this.allReminder();
    this.getFormAnalytics();
    this.getPermission();
    this.createFilterForm();
    this.getAgents();
    this.current_user = this._LocalService.getJsonValue(
      'userInfo_oldLowCalories'
    );
  }

  analyticOptions: any;
  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data;
    });
  }

  superAdminPermission: boolean = false;

  getPermission() {
    this.superAdminPermission = this._GuardService.getPermissionStatus(
      'superadmin_analysis'
    );
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = this.agents_clone = res.data;
        // const groupedUsers = res.data.reduce((acc: any, user: any) => {
        //   const team = user.team;
        //   if (!acc[team]) {
        //     acc[team] = [];
        //   }
        //   acc[team].push(user);
        //   return acc;
        // }, {});
        // this.agents = Object.keys(groupedUsers).map((team) => {
        //   return {
        //     label: team,
        //     items: groupedUsers[team].map((user: any) => ({
        //       label: user.name,
        //       value: user.id,
        //     })),
        //   };
        // });
      },
    });
  }

  reminder: any[] = [];
  allReminder() {
    if (this.appliedFilters) {
      this.getOldFilters();
    } else {
      this._AnalysisService.allReminder().subscribe({
        next: (res) => {
          // res.data.forEach((data: any) => {
          //   if (
          //     new Date(data.reminder_date).toLocaleDateString() ==
          //     new Date().toLocaleDateString()
          //   ) {
          //     this.reminder = [];
          //     this.reminder.push(data);
          //   }
          // });
          this.reminder = res.data;
        },
      });
    }
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
      if (res.status == 1) {
        this.showRow(res.data);
      } else {
        this._MessageService.add({
          severity: 'warn',
          summary: 'Deleted analytic!',
          detail: 'Can not find analytics',
        });
      }
    });
  }
  // ===============================================================Update======================================================================

  updateRow(row: any) {
    this._AnalysisService.analysis.next(row);
    this._Router.navigate(['analysis/update']);
  }

  updateNote(row: any) {
    row.notes = `${row.notes} , ${this.current_user.name} => ${this.updatedNote}`;
    row.dataRequest_id = row.id;
    this._AnalysisService.updateAnalytics(row).subscribe((res) => {
      this.allReminder();
      this.detailsModal = false;
      this.updatedNote = '';
    });
  }

  updatedNote: string = '';
  // ===============================================================Filter======================================================================
  filterModal: boolean = false;
  appliedFilters: any = null;
  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      date: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
      agent_id: new FormControl(null),
      team: new FormControl(null),
    });
    this.valueChanges();
  }

  applyFilter(form: FormGroup) {
    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
          date: null,
        });
      } else {
        form.patchValue({
          date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
        });
      }
    }
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    this.appliedFilters = form.value;
    this._AnalysisService.filtered_Reminder.next(this.appliedFilters);
    this._AnalysisService.filterReminder(form.value).subscribe((res) => {
      this.reminder = res.data;
      this.filterModal = false;
    });
  }

  getOldFilters() {
    this._AnalysisService
      .filterReminder(this.appliedFilters)
      .subscribe((res) => {
        this.reminder = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.allReminder();
    this._AnalysisService.filter.next(null);
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ======================================================= filter by team =================================================

  valueChanges() {
      this.filterForm.get('team')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleAgent(value);
        }
      });
  }
  agents_clone: any[] = [];

  handleAgent(value:string){
    this.agents = this.agents_clone
    this.agents=this.agents.filter(agent => agent.team === value)
  }
}
