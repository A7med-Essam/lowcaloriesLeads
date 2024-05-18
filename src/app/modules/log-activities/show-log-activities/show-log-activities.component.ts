import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GuardService } from 'src/app/services/guard.service';
import { LogsService } from 'src/app/services/logs.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-log-activities',
  templateUrl: './show-log-activities.component.html',
  styleUrls: ['./show-log-activities.component.scss'],
})
export class ShowLogActivitiesComponent implements OnInit {
  createPermission: boolean = false;
  filterPermission: boolean = false;
  logs: any[] = [];
  PaginationInfo: any;
  filterModal: boolean = false;
  detailsModal: boolean = false;
  appliedFilters: any = null;
  filterForm!: FormGroup;
  columns: any[] = [
    { name: 'id', status: false },
    { name: 'agent_name', status: true },
    { name: 'model', status: true },
    { name: 'operation_type', status: true },
    { name: 'created_at', status: true },
  ];

  constructor(
    private _logServices: LogsService,
    private _GuardService: GuardService,
    private _SurveyService: SurveyService
  ) {}

  ngOnInit(): void {
    this.createFilterForm();
    this.getPermission();
    this.getLogActivities();
    this.getAgents();
  }
  getPermission() {
    this.createPermission = this._GuardService.getPermissionStatus('read_logs');
    this.filterPermission =
      this._GuardService.getPermissionStatus('filter_logs');
  }
  createFilterForm() {
    this.filterForm = new FormGroup({
      agent_name: new FormControl(null),
      model: new FormControl(null),
      operation: new FormControl(null),
      date: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
    });
  }
  currentRow: any;
  showRow(row: any) {
    this.detailsModal = true;
    this.currentRow = row;
  }

  filters = {
    agents: [],
    model: [
      'MealCategories',
      'Inquiry',
      'sticky notes',
      'agents',
      'Schedule Jobs',
      'Whatsapp Senders',
      'query list',
      'head mails',
      'gift codes',
      'complaints',
      'target',
      'dislikes',
      'refund',
      'OFFERS',
      'paymentLink',
      'calls',
      'lost reasons',
      'leads',
      'data analytics',
      'roles',
      'branches',
      'auth',
      'customer modal details',
      'Track Schedule Jobs',
      'sql query',
      'permissions',
      'dislikes meals',
      'users',
      'Cron Jobs',
    ],
    operations: [
      'view',
      'show branches',
      'delete',
      'create',
      'calculation',
      'login',
      'run bulk whatsapp',
      'view numbers',
      'attack',
      'assign team',
      'assign role',
      'update',
      'export',
      'update notification',
      'stopped bulk whatsapp',
      'check remain bulk sent',
      'logout',
    ],
  };

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getLogActivities(e.first / e.rows + 1);
  }
  getLogActivities(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._logServices.getLogActivities(page).subscribe({
        next: (res: any) => {
          this.logs = res?.data?.data;
          this.PaginationInfo = res.data;
          // this.filters = {
          //   agents: [...new Set(this.logs.map((e) => e.agent_name))],
          //   model: [...new Set(this.logs.map((e) => e.model))],
          //   operations: [...new Set(this.logs.map((e) => e.operation_type))],
          // };
        },
      });
    }
  }
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.filters.agents = res.data;
      },
    });
  }
  getOldFilters(page: number) {
    this._logServices
      .filterLogActivities(page, this.appliedFilters)
      .subscribe((res: any) => {
        this.logs = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  filter(form: FormGroup) {
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
    this._logServices.filterLogActivities(1, form.value).subscribe((res) => {
      this.logs = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      // this.filterForm.patchValue({
      //   date: null,
      //   from: null,
      //   to: null,
      // });
    });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getLogActivities();
  }

  resetFields() {
    this.filterForm.reset();
  }
}
