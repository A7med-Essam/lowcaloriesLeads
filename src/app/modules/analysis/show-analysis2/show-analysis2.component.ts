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
import { LocalService } from 'src/app/services/local.service';
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
    private fb: FormBuilder,
    private _LocalService:LocalService
  ) {}

  isLoading: boolean = false;

  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  PaginationInfo: any;

  ngOnInit(): void {
    const filterTab = this._LocalService.getJsonValue('analysis_filter');
    if (filterTab) {
      this._AnalysisService.filter.next(filterTab)
    }
    this._AnalysisService.filter
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.appliedFilters = res;
        }
      });
    this.getPermission();
    this.createFilterForm();
    this.createFilterForm1();
    this.getAnalytics();
    this.getFormAnalytics();
    this.getAgents();
    this.getAllAnalyticOptions();
    this.createUploadingForm();
  }

  exportPermission: boolean = false;
  createPermission: boolean = false;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  downloadSamplePermission: boolean = false;
  superAdminPermission: boolean = false;
  uploadFilesPermission: boolean = false;

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
    this.uploadFilesPermission = this._GuardService.getPermissionStatus(
      'upload_analysis'
    );
  }

  analytics: any[] = [];
  getAnalytics(page: number = 1) {
    this.isLoading = true;

    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._AnalysisService.getAnalytics2(page).subscribe({
        next: (res) => {
          this.analytics = res?.data?.data;
          this.PaginationInfo = res.data;
          this.isLoading = false;
        },
      });
    }
  }

  allAnalyticOptions: any;
  getAllAnalyticOptions() {
    // this._AnalysisService.getAllAnalyticOptions().subscribe((res) => {
    //   this.allAnalyticOptions = res.data;
    //   Object.keys(this.allAnalyticOptions).forEach((c, index) => {
    //     this.filterForm.addControl(c, this.fb.control(''));
    //   });
    // });
    this.allAnalyticOptions = [];
  }

  getObjectKeyValues(obj: any): any[] {
    return this.allAnalyticOptions[obj];
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getAnalytics(e.first / e.rows + 1);
  }

  // ********************************************************FILTER OPTIONS********************************************************************
  agents: any[] = [];
  agents_clone: any[] = [];
  isLoadingAgent: boolean = false;
  isLoadingFilter: boolean = false;

  getAgents() {
    this.isLoadingAgent = true;

    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.isLoadingAgent = false;
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

  // ===============================================================Export======================================================================

  export() {
    if (this.exportPermission) {
      this.isLoading = true;

      let exportObservable;
      if (this.appliedFilters) {
        // const ids = this.analytics.map((obj: any) => obj.id);
        const ids = this.allFilteredAnalytics2.map((obj: any) => obj.id);
        exportObservable = this._AnalysisService.exportByIds(ids);
      } else {
        exportObservable = this._AnalysisService.exportAllV2();
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
    this.isLoading = true;

    // this.filterForm.patchValue({
    //   data_options: this.getFilterOptions(this.filterForm.value),
    // });
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
        this.isLoading = false;
        this.filterModal = false;
      });

    this._AnalysisService
      .filterAnalyticsWithoutPaginationV2(1, form.value)
      .subscribe((res) => {
        this.allFilteredAnalytics2 = res.data;
      });
  }
  allFilteredAnalytics2: any;

  getOldFilters(page: number) {
    delete this.appliedFilters.withoutPagination;
    this._AnalysisService
      .filterAnalytics(page, this.appliedFilters)
      .subscribe((res) => {
        this.analytics = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
        this.isLoading = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getAnalytics();
    this._AnalysisService.filter.next(null);
    this.getFormAnalytics();
    this.agents = this.agents_clone

  }

  resetFields() {
    this.getFormAnalytics();
    this.agents = this.agents_clone
    this.filterForm.reset();
  }

  // ===============================================================Details======================================================================
  currentRow: any;
  detailsModal: boolean = false;
  showRow(log: any) {
    this.currentRow = log;
    this.detailsModal = true;
    this._AnalysisService.getFiles(log.id).subscribe(res=>{
      this.currentRow.files = res.data.files;
    })
  }

  updateRow(row: any) {
    if (row.version == 'v1') {
      this._AnalysisService.analysis.next(row);
      this._Router.navigate(['analysis/update']);
    } else {
      this._AnalysisService.analysisV2.next(row);
      this._Router.navigate(['analysis/updateV2']);
    }
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
    } else {
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

  teams: any[] = [];
  getFormAnalytics() {
    this.isLoadingFilter = true;
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data.options;
      this.analyticOptions1 = res.data;
      this.teams = res.data.teams;
      this.emirates = res.data.emirates;
      this.options = [res.data.options];
      this.isLoadingFilter = false;
    });
  }

  storeSelectedOptions(e: any, index: number) {
    // const selectedIndex = this.getArrayIndex(e.value, index);
    // this.options.splice(index + 1);
    // if (this.options[index][selectedIndex].has_children) {
    //   this.options.push(this.options[index][selectedIndex].children);
    // }

    const selectedIndex = this.getArrayIndex(e.value, index);
    this.options.splice(index + 1);
    if (this.options[index][selectedIndex]?.has_children) {
      if (this.options[index][selectedIndex].children) {
        this.options.push(this.options[index][selectedIndex].children);
      } else {
        this.isLoadingFilter = true;
        this._AnalysisService
        .getAnalyticsChildrenById(this.options[index][selectedIndex].id)
        .subscribe((res) => {
            this.isLoadingFilter = false;
            this.options[index][selectedIndex].children = res.data;
            this.options.push(this.options[index][selectedIndex].children);
          });
      }
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
  // ===============================================================FILTER 3======================================================================
  getFilterOptions(values: any) {
    const data: any[] = [];
    Object.keys(this.allAnalyticOptions).forEach((e) => {
      if (values[e] != '') {
        data.push({ label: e, name: values[e] });
      }
    });
    return data;
  }

  // ===============================================================FILTER V1======================================================================
  applyFilter1(form: FormGroup) {
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
    this._AnalysisService.filter.next(this.appliedFilters);
    this._AnalysisService.filterAnalytics(1, form.value).subscribe((res) => {
      this.analytics = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal1 = false;
      this.isLoading = false;
    });
    this._AnalysisService
      .filterAnalyticsWithoutPagination(1, form.value)
      .subscribe((res) => {
        this.allFilteredAnalytics = res.data;
      });
  }

  filterModal1: boolean = false;
  appliedFilters1: any = null;
  filterForm1!: FormGroup;
  createFilterForm1() {
    this.filterForm1 = new FormGroup({
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

  allFilteredAnalytics: any[] = [];

  getOldFilters1(page: number) {
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

  resetFilter1() {
    this.appliedFilters = null;
    this.filterModal1 = false;
    this.filterForm1.reset();
    this.agents = this.agents_clone
    this.getAnalytics();
    this._AnalysisService.filter.next(null);
  }

  resetFields1() {
    this.filterForm1.reset();
    this.agents = this.agents_clone
  }

  analyticOptions1: any;
  // ********************************************************FILTER OPTIONS********************************************************************
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

      this.filterForm
      .get('team')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleAgent(value);
        }
      });
      this.filterForm1
      .get('team')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleAgent(value);
        }
      });
  }

  handleAgent(value:string){
    this.agents = this.agents_clone
    this.agents=this.agents.filter(agent => agent.team === value)
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

  export1() {
    if (this.exportPermission) {
      this.isLoading = true;

      let exportObservable;
      if (this.appliedFilters && this.allFilteredAnalytics.length) {
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

    // ****************************************************upload File Modal************************************************************************
    uploadFilesModal: boolean = false;
    uploadingStatus: boolean = false;
    uploadForm!: FormGroup;
  
    displayUploadFilesModal(id: number) {
      if (this.uploadFilesPermission) {
        this.uploadForm.patchValue({
          data_analytic_request_id: id,
        });
        this.uploadFilesModal = true;
      }
    }
  
    getUploadedFile(event: any) {
      if (
        event.target.files &&
        event.target.files.length &&
        this.uploadFilesPermission
        ) {
        const files = event.target.files;
        const readFile = (file: any) => {
          return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (event: any) => resolve(event.target.result);
            fileReader.onerror = (error) => reject(error);
            fileReader.readAsDataURL(file);
          });
        };
  
        const readFiles = async () => {
          try {
            const base64Strings = await Promise.all(
              Array.from(files).map(readFile)
            );
            const fileTypes = base64Strings.map((base64String: any) => {
              const type = base64String.split(',')[0].split(':')[1].split(';')[0];
              return { [type]: base64String };
            });
            this.uploadForm.patchValue({
              files: fileTypes,
            });
          } catch (error) {
            console.error(error);
          }
        };
        readFiles();
      }
    }
  
    createUploadingForm() {
      this.uploadForm = new FormGroup({
        data_analytic_request_id: new FormControl(null, [Validators.required]),
        files: new FormControl(null, [Validators.required]),
      });
    }
  
    uploadFiles(form: FormGroup) {
      if (form.valid && this.uploadFilesPermission) {
        this.uploadingStatus = true;
        this._AnalysisService.uploadFiles(form.value).subscribe((res) => {
          this.uploadingStatus = false;
          this.uploadFilesModal = false;
        });
      }
    }
}
