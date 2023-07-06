import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { CallsService, ICalls } from 'src/app/services/calls.service';
import { SurveyService } from 'src/app/services/survey.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';
import { Router } from '@angular/router';
import { GuardService } from 'src/app/services/guard.service';

@Component({
  selector: 'app-show-calls',
  templateUrl: './show-calls.component.html',
  styleUrls: ['./show-calls.component.scss'],
})
export class ShowCallsComponent implements OnInit {
  constructor(
    private _CallsService: CallsService,
    private _SurveyService: SurveyService,
    private _DislikeService: DislikeService,
    private _LocalService: LocalService,
    private _Router: Router,
    private _GuardService:GuardService
  ) {}
  createCallsPermission: boolean = false;
  getPermission() {
    this.createCallsPermission = this._GuardService.getPermissionStatus('create_calls');
  }

  calls: ICalls[] = [];
  PaginationInfo: any;

  ngOnInit(): void {
    this.getCalls();
    this.getAgents();
    this.createFilterForm();
    this.getAgentBranches();
    this.getPermission();
  }

  getCalls(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._CallsService
        .getAgentCalls(
          page,
          this._LocalService.getJsonValue('userInfo_oldLowCalories')?.id
        )
        .subscribe({
          next: (res) => {
            this.calls = res?.data?.data;
            this.PaginationInfo = res.data;
          },
        });
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getCalls(e.first / e.rows + 1);
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  // ****************************************************filter columns************************************************************************
  filterColumns: boolean = false;
  selectedColumns: any[] = [];
  specificRows: number[] = [];
  columns: any[] = [
    { name: 'id', status: false },
    { name: 'cid', status: true },
    { name: 'Remaining_days', status: true },
    { name: 'branch', status: true },
    { name: 'customer_name', status: true },
    { name: 'customer_phone', status: false },
    { name: 'customer_mobile', status: false },
    { name: 'plan', status: true },
    { name: 'date', status: true },
    { name: 'note', status: false },
    // { name: 'voice', status: false },
    { name: 'agent_uploaded', status: false },
    { name: 'created_at', status: false },
  ];

  getFilterColumns() {
    this.columns.forEach((element) => {
      element.status = false;
    });

    this.selectedColumns.forEach((e) => {
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].name == e) {
          this.columns[i].status = true;
        }
      }
    });
  }

  selectAllColumns(checkboxContainer: HTMLElement, currentCheckbox: Checkbox) {
    setTimeout(() => {
      if (!currentCheckbox.checked()) {
        this.selectedColumns = [];
      } else {
        let checkboxes: HTMLLabelElement[] = [];
        this.selectedColumns = [];
        for (let i = 0; i < checkboxContainer.children.length; i++) {
          checkboxes.push(checkboxContainer.children[i].children[1] as any);
        }
        this.columns.forEach((e) => {
          this.selectedColumns.push(e.name);
        });
      }
    }, 1);
  }

  getSpecificRows(input: HTMLInputElement) {
    if (input.checked) {
      this.specificRows.push(Number(input.value));
    } else {
      const index = this.specificRows.indexOf(Number(input.value));
      if (index > -1) {
        this.specificRows.splice(index, 1);
      }
    }
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;
  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      date: new FormControl(null),
      cid: new FormControl(null),
      subscription_id: new FormControl(null),
      branch: new FormControl(null),
      customer_name: new FormControl(null),
      mobile: new FormControl(null),
      customer_phone: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
      assigned_id: new FormControl(null),
      plan: new FormControl(null),
      agent_uploaded_id: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
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
    this._CallsService
      .filterAgentCalls(
        1,
        form.value,
        this._LocalService.getJsonValue('userInfo_oldLowCalories')?.id
      )
      .subscribe((res) => {
        this.calls = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
        this.filterForm.patchValue({
          date: null,
          from: null,
          to: null,
        });
      });
  }

  getOldFilters(page: number) {
    this._CallsService
      .filterAgentCalls(
        page,
        this.appliedFilters,
        this._LocalService.getJsonValue('userInfo_oldLowCalories')?.id
      )
      .subscribe((res) => {
        this.calls = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getCalls();
  }

  resetFields() {
    this.filterForm.reset();
  }

  branches: any[] = [];
  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  // ****************************************************add call************************************************************************

  routeToCreateCall(call: any) {
    if (call) {
      this._CallsService.call.next(call);
      this._Router.navigate(['calls/create']);
    }
  }
    // ****************************************************upload Modal************************************************************************
    uploadModal: boolean = false;

    getSample() {
      this._CallsService.getSample().subscribe((res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      });
    }
  
    getFormData(object: any) {
      const formData = new FormData();
      Object.keys(object).forEach((key) => formData.append(key, object[key]));
      return formData;
    }
  
    onFileSelected(event: any) {
      const file: File = event.target.files[0];
      if (file) {
        let f: File = this.getFormData({ file: file }) as any;
        this._CallsService.uploadFile(f).subscribe({
          next: (res) => {
            this.uploadModal = false;
            this.getCalls();
          },
        });
        this.uploadModal = false;
      }
    }

    showRow(call: any) {
      if (call) {
        this._CallsService.call.next(call);
        this._Router.navigate(['calls/details']);
      }
    }
}
