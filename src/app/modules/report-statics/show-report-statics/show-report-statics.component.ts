import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import {
  BranchCount,
  CustomerData,
  DataRequests,
  DataSubscription,
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
  openDiffModal: boolean = false;
  data: {
    data: CustomerData[];
    count_data: BranchCount[];
  } = { data: [], count_data: [] };

  branchData: CustomerData[] = [];

  requestsData: DataRequests[] = [];
  subscriptionsData: DataSubscription[] = [];
  title: string = '';
  modelDetailTitle: string = '';

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
      status: new FormControl(null),
      date: new FormControl(null, [Validators.required]),
      date_from: new FormControl(null),
      date_to: new FormControl(null),
    });
  }

  sum: number = 0;

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
          this.newLeadData = res.data;
          this.isLoading = false;
        });
    } else {
      this._reportStaticsServices
        .getModelFilteration(form.value)
        .subscribe((res) => {
          if (
            form.value.model == 'location' ||
            form.value.model == 'update customer meal' ||
            form.value.model == 'accounts_status'
          ) {
            this.data = res.data;
            this.sum = this.data?.count_data?.reduce(
              (accumulator, currentValue) => {
                return accumulator + currentValue.count;
              },
              0
            );
          }

          this.isLoading = false;
        });
    }
  }
  openModal(branch: any) {
    this.branchData = this.data.data.filter((item) => item.branch === branch);
    this.openBrachDetailModal = true;
    console.log(this.branchData);
  }
  openModalDetails(model: string, type: string) {
    if (type == 'social_media') {
      if (model == 'cs_s') {
        this.title = 'Customer Services un Subscription';
        this.subscriptionsData =
          this.newLeadData?.CustomerServices_subscribeSubscriptions || [];
      } else if (model == 'cs_un') {
        this.title = 'Customer Services un Subscription';
        this.subscriptionsData =
          this.newLeadData?.CustomerServices_unSubscribeSubscriptions || [];
      } else if (model == 'c_s') {
        this.title = 'Clinic Subscription';
        this.subscriptionsData =
          this.newLeadData?.Clinic_subscribeSubscriptions || [];
      } else {
        // c_un
        this.title = 'Clinic Un Subscription';
        this.subscriptionsData =
          this.newLeadData?.Clinic_unSubscribeSubscriptions || [];
      }
      this.modelDetailTitle = 'social_media';
    } else if (type == 'new_lead') {
      if (model == 'social') {
        this.title = 'Social Media';
        this.requestsData = this.newLeadData.SocialRequests || [];
      } else if (model == 'calls') {
        this.title = 'Calls';
        this.requestsData = this.newLeadData.CallRequests || [];
      } else {
        this.title = 'WhatsApp';
        this.requestsData = this.newLeadData.WhatsappRequests || [];
      }
      this.modelDetailTitle = 'new_lead';
    } else {
      if (model == 'branches') {
        this.title = 'Branches';
        this.subscriptionsData = this.newLeadData?.BranchSubscriptions || [];
      } else if (model == 'calls') {
        this.title = 'Call Subscription';
        this.subscriptionsData = this.newLeadData?.CallSubscriptions || [];
      } else if (model == 'whatsapp') {
        this.title = 'whatsapp Subscription';
        this.subscriptionsData = this.newLeadData?.WhatsappSubscriptions || [];
      } else {
        // c_un
        this.title = 'online Subscription';
        this.subscriptionsData = this.newLeadData?.OnlineSubscriptions || [];
      }
      this.modelDetailTitle = 'new_subscriptions';
    }

    this.openDiffModal = true;
    console.log(model);
  }
  getStatusAsString(status: any) {
    console.log(status);
    if (status == '0') {
      return 'De Active';
    } else if (status == '1') {
      return 'Active';
    } else {
      return 'Restricted';
    }
  }
}
