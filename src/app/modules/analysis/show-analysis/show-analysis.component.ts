import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';
import { GuardService } from 'src/app/services/guard.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-analysis',
  templateUrl: './show-analysis.component.html',
  styleUrls: ['./show-analysis.component.scss'],
})
export class ShowAnalysisComponent implements OnInit, OnDestroy {
  constructor(
    private _GuardService: GuardService,
    private _MessageService: MessageService,
    private _AnalysisService: AnalysisService,
    private _SurveyService: SurveyService,
    private _ConfirmationService: ConfirmationService,
    private _Router: Router
  ) {}
  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  isLoading: boolean = false;

  PaginationInfo: any;

  ngOnInit(): void {
    this._AnalysisService.filterv1
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.appliedFilters = res;
        }
      });
    this.getPermission();
    this.createFilterForm();
    this.getAnalytics();
    this.getFormAnalytics();
    this.getAgents();
  }

  exportPermission: boolean = false;
  createPermission: boolean = false;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  downloadSamplePermission: boolean = false;
  superAdminPermission: boolean = false;

  getPermission() {
    this.exportPermission =
      this._GuardService.getPermissionStatus('export_analysis');
    this.createPermission =
      this._GuardService.getPermissionStatus('create_analysis');
    this.updatePermission =
      this._GuardService.getPermissionStatus('update_analysis');
    this.deletePermission =
      this._GuardService.getPermissionStatus('delete_analysis');
    this.downloadSamplePermission = this._GuardService.getPermissionStatus(
      'downloadSample_analysis'
    );
    this.superAdminPermission = this._GuardService.getPermissionStatus(
      'superadmin_analysis'
    );
  }

  analytics: any[] = [];
  getAnalytics(page: number = 1) {
    this.isLoading = true;
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._AnalysisService.getAnalytics(page).subscribe({
        next: (res) => {
          this.analytics = res?.data?.data;
          this.PaginationInfo = res.data;
          this.isLoading = false;
        },
      });
    }
  }

  analyticOptions: any;
  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data;
    });
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getAnalytics(e.first / e.rows + 1);
  }

  // ********************************************************FILTER OPTIONS********************************************************************
  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        const groupedUsers = res.data.reduce((acc: any, user: any) => {
          const team = user.team;
          if (!acc[team]) {
            acc[team] = [];
          }
          acc[team].push(user);
          return acc;
        }, {});
        this.agents = Object.keys(groupedUsers).map((team) => {
          return {
            label: team,
            items: groupedUsers[team].map((user: any) => ({
              label: user.name,
              value: user.id,
            })),
          };
        });
      },
    });
  }

  valueChanges() {
    this.filterForm
      .get('platform')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handlePlatform(value);
        }
      });

    this.filterForm
      .get('mode')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleMode(value);
        }
      });

    this.filterForm
      .get('ask_for')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleAskFor(value);
        }
      });
  }

  platformOptions: [] = [];
  handlePlatform(value: string) {
    this.platformOptions = this.analyticOptions.platforms.find(
      (item: any) => item.name === value
    ).options;
  }

  modeReasons: [] = [];
  handleMode(value: string) {
    this.modeReasons = this.analyticOptions.mode.find(
      (item: any) => item.name === value
    ).reasons;
  }

  askReasons: [] = [];
  askActions: [] = [];
  handleAskFor(value: string) {
    this.askReasons = this.analyticOptions[value].reasons;
    this.askActions = this.analyticOptions[value].actions;
  }

  // ===============================================================Export======================================================================

  export() {
    if (this.exportPermission) {
      this.isLoading = true;

      let exportObservable;
      if (this.appliedFilters) {
        // const ids = this.analytics.map((obj: any) => obj.id);
        const ids = this.allFilteredAnalytics.map((obj: any) => obj.id);
        exportObservable = this._AnalysisService.exportByIds(ids);
      } else {
        exportObservable = this._AnalysisService.exportAll();
      }
      exportObservable.subscribe({
        next: (res) => {
          this.handleExportSuccess(res.data);
        },
      });
    }
  }

  private handleExportSuccess(data: any) {
    this.isLoading = false;

    this._MessageService.add({
      severity: 'success',
      summary: 'Export Excel',
      detail: 'Exported Successfully',
    });

    const link = document.createElement('a');
    link.target = '_blank';
    link.href = data;
    link.click();
  }

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
      mobile: new FormControl(null),
      customer_name: new FormControl(null),
      customer_gender: new FormControl(null),
      emirate_id: new FormControl(null),
      platform: new FormControl(null),
      platform_option: new FormControl(null),
      customer_status: new FormControl(null),
      concern: new FormControl(null),
      mode: new FormControl(null),
      mode_reason: new FormControl(null),
      notes: new FormControl(null),
      ask_for: new FormControl(null),
      ask_for_options: new FormControl(null),
      actions: new FormControl(null),
      team: new FormControl(null),
    });
    this.valueChanges();
  }

  applyFilter(form: FormGroup) {
    this.isLoading = true;

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
    this._AnalysisService.filterv1.next(this.appliedFilters);
    this._AnalysisService.filterAnalytics(1, form.value).subscribe((res) => {
      this.analytics = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      this.isLoading = false;
    });
    this._AnalysisService
      .filterAnalyticsWithoutPagination(1, form.value)
      .subscribe((res) => {
        this.allFilteredAnalytics = res.data;
      });
  }

  allFilteredAnalytics: any[] = [];

  getOldFilters(page: number) {
    this._AnalysisService
      .filterAnalytics(page, this.appliedFilters)
      .subscribe((res) => {
        this.analytics = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
        this.isLoading = false;
      });

    this._AnalysisService
      .filterAnalyticsWithoutPagination(1, this.appliedFilters)
      .subscribe((res) => {
        this.allFilteredAnalytics = res.data;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getAnalytics();
    this._AnalysisService.filterv1.next(null);
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ===============================================================Details======================================================================
  currentRow: any;
  detailsModal: boolean = false;
  showRow(log: any) {
    this.currentRow = log;
    this.detailsModal = true;
  }

  updateRow(row: any) {
    this._AnalysisService.analysis.next(row);
    this._Router.navigate(['analysis/update']);
  }
  // ===============================================================Details======================================================================

  deleteRow(id: number) {
    this._AnalysisService.deleteAnalytics(id).subscribe((res) => {
      this.getAnalytics();
    });
  }

  confirm(id: any) {
    this._ConfirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }
  // ===============================================================UPLOAD FILE======================================================================

  displayUploadModal() {
    if (this.downloadSamplePermission) {
      this.uploadModal = true;
    }
  }

  uploadModal: boolean = false;

  getSample() {
    if (this.downloadSamplePermission) {
      this._AnalysisService.getSample().subscribe((res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      });
    }
  }

  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }

  onFileSelected(event: any) {
    // if (this.downloadSamplePermission) {
    //   const file: File = event.target.files[0];
    //   if (file) {
    //     let f: File = this.getFormData({ file: file }) as any;
    //     this._AnalysisService.uploadFile(f).subscribe({
    //       next: (res) => {
    //         this.uploadModal = false;
    //         this.getAnalytics();
    //       },
    //     });
    //     this.uploadModal = false;
    //   }
    // }
  }
}
