import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';
import { GuardService } from 'src/app/services/guard.service';
import { RefundService } from 'src/app/services/refund.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-analysis2',
  templateUrl: './show-analysis2.component.html',
  styleUrls: ['./show-analysis2.component.scss'],
})
export class ShowAnalysis2Component implements OnInit {
  constructor(
    private _GuardService: GuardService,
    private _MessageService: MessageService,
    private _AnalysisService: AnalysisService,
    private _SurveyService: SurveyService,
    private _ConfirmationService: ConfirmationService,
    private _Router: Router,
    private _RefundService: RefundService,
    private fb: FormBuilder
  ) {}
  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  PaginationInfo: any;

  ngOnInit(): void {
    this._AnalysisService.filter
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
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._AnalysisService.getAnalytics2(page).subscribe({
        next: (res) => {
          this.analytics = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  // analyticOptions: any;
  // getFormAnalytics() {
  //   this._AnalysisService.getFormAnalytics().subscribe((res) => {
  //     this.analyticOptions = res.data;
  //   });
  // }

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

  // ===============================================================Export======================================================================

  export() {
    if (this.exportPermission) {
      let exportObservable;
      if (this.appliedFilters) {
        const ids = this.analytics.map((obj: any) => obj.id);
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
    this.filterForm = this.fb.group({
      mobile: '',
      cid: '',
      customer_name: '',
      customer_gender: '',
      data_options: '',
      team: '',
      agent_id: '',
    });
  }

  applyFilter(form: FormGroup) {
    // if (form.value.date) {
    //   if (form.value.date[1]) {
    //     form.patchValue({
    //       from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
    //       to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
    //       date: null,
    //     });
    //   } else {
    //     form.patchValue({
    //       date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
    //     });
    //   }
    // }
    // for (const prop in form.value) {
    //   if (form.value[prop] === null) {
    //     delete form.value[prop];
    //   }
    // }
    this.filterForm.patchValue({
      data_options: this.buildHierarchy(),
    });
    this.appliedFilters = form.getRawValue();
    this._AnalysisService.filter.next(this.appliedFilters);
    this._AnalysisService
      .filterAnalyticsV2(1, form.getRawValue())
      .subscribe((res) => {
        this.analytics = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  getOldFilters(page: number) {
    this._AnalysisService
      .filterAnalytics(page, this.appliedFilters)
      .subscribe((res) => {
        this.analytics = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getAnalytics();
    this._AnalysisService.filter.next(null);
    this.getFormAnalytics();
  }

  resetFields() {
    this.getFormAnalytics();
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
    this._AnalysisService.analysisV2.next(row);
    this._Router.navigate(['analysis/updateV2']);
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

  // ===============================================================FILTER 2======================================================================
  getCustomerCID(e: HTMLInputElement) {
    if (e.value != '') {
      this._RefundService.getCIDs(e.value).subscribe((res) => {
        this.cids = res;
      });
    }else{
      this.cids = [];
    }
  }

  getCustomerInfo(e: any) {
    const selectedCID = this.cids.find((c) => c.cid == e.value);
    this._RefundService.getPlanDetails(selectedCID.cid).subscribe((res) => {
      this.filterForm.patchValue({
        customer_name: res.customerName,
      });
    });
  }

  teams:any[] =[]
  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data.options;
      this.teams = res.data.teams;
      this.emirates = res.data.emirates;
      this.options = [res.data.options];
    });
  }

  storeSelectedOptions(e: any, index: number) {
    const selectedIndex = this.getArrayIndex(e.value, index);
    this.options.splice(index + 1);
    if (this.options[index][selectedIndex].has_children) {
      this.options.push(this.options[index][selectedIndex].children);
    }
  }

  getArrayIndex(name: string, index: number) {
    if (this.options[index]) {
      this.options[index].map((option: any) => {
        option.selected = false;
        if (option.name === name) {
          option.selected = true;
        }
      });
      return this.options[index].findIndex(
        (option: any) => option.name === name
      );
    }
    return -1;
  }

  filterSelected(arr: any[]) {
    const result: any[] = [];

    arr.forEach((item) => {
      if (item.hasOwnProperty('selected') && item.selected === true) {
        result.push(item);
      }

      if (item.children && item.children.length > 0) {
        const filteredChildren = this.filterSelected(item.children);
        if (filteredChildren.length > 0) {
          const newItem = { ...item, children: filteredChildren };
          result.push(newItem);
        }
      }
    });

    return result;
  }

  buildHierarchy() {
    const filteredArray = this.options.map((subArray: any) =>
      this.filterSelected(subArray)
    );
    let outputArray: any[] = [];
    filteredArray.forEach((innerArray) => {
      if (innerArray.length > 0) {
        outputArray.push(innerArray[0]);
      }
    });
    let data: any[] = [];
    outputArray.map((e) => {
      return data.push({
        label: e.label,
        name: e.name,
      });
    });
    return data;
    // return this.convertHierarchy(outputArray.map((e) => e.name));
  }

  cids: any[] = [];
  options: any[] = [];
  analyticOptions: any;
  emirates: any[] = [];
}
