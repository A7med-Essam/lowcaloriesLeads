import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import {
  BranchCount,
  CustomerData,
  NewLead,
  ReportStaticsService,
} from 'src/app/services/reportStatics.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-show-report-statics',
  templateUrl: './show-report-statics.component.html',
  styleUrls: ['./show-report-statics.component.scss'],
})
export class ShowReportStaticsComponent implements OnInit {
  constructor(
    private _reportStaticsServices: ReportStaticsService,
    private confirmationService: ConfirmationService,
    private _MessageService: MessageService
  ) {
    this.createFilterForm();
  }
  isLoading: boolean = false;
  openBrachDetailModal: boolean = false;
  data: {
    data: CustomerData[];
    count_data: BranchCount[];
  } = { data: [], count_data: [] };

  branchData: CustomerData[] = [];
  logicTabelWithModal: any[] = [
    'location',
    'update customer meal',
    'accounts_status',
  ];
  newLeadData!: NewLead;

  logicTabelWithCards: any[] = [
    'new_lead',
    'new_subscriptions',
    'social_media',
  ];
  models: any[] = [
    { label: 'Location', value: 'location' },
    { label: 'Change Meal', value: 'update customer meal' },
    { label: 'Accounts Status', value: 'accounts_status' },
    { label: 'New Leads', value: 'new_lead' },
    { label: 'New Subscriptions', value: 'new_subscriptions' },
    { label: 'Social Media', value: 'social_media' },
  ];
  accounts_status: any[] = [
    { label: 'De Actvie', value: '0' },
    { label: 'Active', value: '1' },
    { label: 'Restricted', value: '2' },
  ];

  ngOnInit(): void {}

  appliedFilters: any = null;
  filterForm!: FormGroup;

  createFilterForm() {
    this.filterForm = new FormGroup({
      model: new FormControl(null, [Validators.required]),
      accounts_status: new FormControl(null),
      date: new FormControl(null, [Validators.required]),
      date_from: new FormControl(null),
      date_to: new FormControl(null),
    });
  }

  resetFields() {
    this.filterForm.reset();
  }
  resetFilter() {
    this.appliedFilters = null;
    this.filterForm.reset();
  }
  filter(form: FormGroup) {
    this.isLoading = true;
    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          date_from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          date_to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
        });
      } else {
        form.patchValue({
          date_from:
            form.value.date[0] == null
              ? new Date().toLocaleDateString('en-CA')
              : new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          date_to:
            form.value.date[1] == null
              ? new Date().toLocaleDateString('en-CA')
              : new Date(form.value.date[1]).toLocaleDateString('en-CA'),
        });
      }
    }

    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }

    this.appliedFilters = form.value;
    console.log(this.appliedFilters);
    this._reportStaticsServices.modelReport_filter.next(this.appliedFilters);
    if (
      form.value.model == 'new_lead' ||
      form.value.model == 'social_media' ||
      form.value.model == 'new_subscriptions'
    ) {
      this._reportStaticsServices
        .getNewLeadFilteration(form.value)
        .subscribe((res) => {
          console.log(res.data);
          console.log(form.value.model);
          this.newLeadData = res.data;
          this.isLoading = false;
        });
    } else {
      this._reportStaticsServices
        .getModelFilteration(form.value)
        .subscribe((res) => {
          console.log(res.data);
          console.log(form.value.model);
          if (
            form.value.model == 'location' ||
            form.value.model == 'update customer meal' ||
            form.value.model == 'accounts_status'
          ) {
            this.data = res.data;
            console.log(res.data);
          }

          // this.data = res.data;
          this.isLoading = false;
          // this.resetFilter();
        });
    }
  }
  openModal(branch: any) {
    this.branchData = this.data.data.filter((item) => item.branch === branch);
    this.openBrachDetailModal = true;
    console.log(this.branchData);
  }
}
