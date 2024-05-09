import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GuardService } from 'src/app/services/guard.service';
import { LogsService } from 'src/app/services/logs.service';

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
    private _Router: Router,
    private _logServices: LogsService,
    private _GuardService: GuardService
  ) {}

  ngOnInit(): void {
    this.createFilterForm();
    this.getPermission();
    this.getLogActivities();
  }
  getPermission() {
    this.createPermission = this._GuardService.getPermissionStatus('read_logs');
    this.filterPermission =
      this._GuardService.getPermissionStatus('filter_logs');
  }
  createFilterForm() {
    this.filterForm = new FormGroup({
      code: new FormControl(null),
      flag: new FormControl(null),
      status: new FormControl(null),
      percentage: new FormControl(null),
      date: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
    });
  }
  showRow(code: any) {
    if (code) {
      // this._GiftcodeService.giftcode.next(code);
      // this._Router.navigate(['giftcode/details']);
    }
  }

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
        },
      });
    }
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
