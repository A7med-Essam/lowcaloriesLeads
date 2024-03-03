import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import {
  AccountStatusItem,
  AccountStatusModel,
  BranchCount,
  CustomerData,
  DataRequests,
  DataSubscription,
  NewLead,
  ReportStaticsService,
} from 'src/app/services/reportStatics.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Calendar } from 'primeng/calendar';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { inject } from '@angular/core/testing';
import { UsersService } from 'src/app/services/users.service';
import { AppService } from 'src/app/services/app.service';
import { FilterData } from '../filter-data.pipe';

@Component({
  selector: 'app-show-report-statics',
  templateUrl: './show-report-statics.component.html',
  styleUrls: ['./show-report-statics.component.scss'],
  providers: [NavbarComponent],
})
export class ShowReportStaticsComponent implements OnInit {
  new: any;
  constructor(
    private _reportStaticsServices: ReportStaticsService,
    private confirmationService: ConfirmationService,
    private appService: AppService,
    private _UserServices: UsersService,
    private _MessageService: MessageService
  ) {
    this.createFilterForm();
  }
  isLoading: boolean = false;
  openBrachDetailModal: boolean = false;
  openDiffModal: boolean = false;
  dateFrom: string = '';
  data: {
    data: CustomerData[];
    count_data: BranchCount[];
  } = { data: [], count_data: [] };

  accountStatusAll: {
    DEACTIVE: AccountStatusModel | null;
    ACTIVE: AccountStatusModel | null;
    RESTRICTED: AccountStatusModel | null;
  } = {
    DEACTIVE: null,
    ACTIVE: null,
    RESTRICTED: null,
  };
  filterDataPipe = new FilterData();

  branchData: CustomerData[] = [];
  s_branch_renew: number = 0;
  s_online_renew: number = 0;
  s_whatsapp_renew: number = 0;
  s_call_renew: number = 0;

  m_cs_s_renew: number = 0;
  m_cs_un_renew: number = 0;
  m_c_s_renew: number = 0;
  m_c_un_renew: number = 0;

  requestsData: DataRequests[] = [];
  subscriptionsData: DataSubscription[] = [];
  title: string = '';
  exportLink: string = '';
  modelDetailTitle: string = '';

  logicTabelWithModal: any[] = [
    'location',
    'update customer meal',
    'accounts_status',
    'accounts_status_from_to',
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
    { label: 'Accounts Status 3th', value: 'accounts_status_from_to' },
    { label: 'New Leads', value: 'new_lead' },
    { label: 'Total Subscriptions', value: 'new_subscriptions' },
    { label: 'Social Media', value: 'social_media' },
  ];
  accounts_status: any[] = [
    { label: 'All', value: 'all' },
    { label: 'De Actvie', value: '0' },
    { label: 'Active', value: '1' },
    { label: 'Restricted', value: '2' },
  ];

  ngOnInit(): void {}
  onModelChange(e: any) {
    this.s_branch_renew = 0;
    this.s_online_renew = 0;
    this.s_whatsapp_renew = 0;
    this.s_call_renew = 0;
    this.m_cs_s_renew = 0;
    this.m_cs_un_renew = 0;
    this.m_c_s_renew = 0;
    this.m_c_un_renew = 0;
    this.requestsData = [];
    this.subscriptionsData = [];
    this.newLeadData = {};
  }
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

  getFormattedDate(dateString: string): Date {
    var currentDate = new Date(dateString);
    currentDate.setDate(currentDate.getDate() - 90);
    return new Date(currentDate);
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
          if (form.value.model == 'new_subscriptions') {
            this.s_branch_renew =
              this.newLeadData.BranchSubscriptions?.filter((subscription) => {
                return subscription.customer_type === 'renew';
              }).length || 0;

            this.s_call_renew =
              this.newLeadData.CallSubscriptions?.filter((subscription) => {
                return subscription.customer_type === 'renew';
              }).length || 0;

            this.s_whatsapp_renew =
              this.newLeadData.WhatsappSubscriptions?.filter((subscription) => {
                return subscription.customer_type === 'renew';
              }).length || 0;

            this.s_online_renew =
              this.newLeadData.OnlineSubscriptions?.filter((subscription) => {
                return subscription.customer_type === 'renew';
              }).length || 0;
          } else if (form.value.model == 'social_media') {
            this.m_cs_s_renew =
              this.newLeadData.CustomerServices_subscribeSubscriptions?.filter(
                (subscription) => {
                  return subscription.customer_type === 'renew';
                }
              ).length || 0;

            this.m_cs_un_renew =
              this.newLeadData.CustomerServices_unSubscribeSubscriptions?.filter(
                (subscription) => {
                  return subscription.customer_type === 'renew';
                }
              ).length || 0;

            this.m_c_s_renew =
              this.newLeadData.Clinic_subscribeSubscriptions?.filter(
                (subscription) => {
                  return subscription.customer_type === 'renew';
                }
              ).length || 0;

            this.m_c_un_renew =
              this.newLeadData.Clinic_unSubscribeSubscriptions?.filter(
                (subscription) => {
                  return subscription.customer_type === 'renew';
                }
              ).length || 0;
          }

          //           s_branch_renew
          // s_online_renew
          // s_whatsapp_renew
          // s_call_renew
          this.isLoading = false;
        });
    } else if (form.get('status')?.value == 'all') {
      this._reportStaticsServices
        .getAccountStatusAllFilteration(form.value)
        .subscribe((res) => {
          if (
            form.value.model == 'accounts_status' ||
            form.value.model == 'accounts_status_from_to'
          ) {
            this.accountStatusAll = res.data;
            this.sum =
              (this.accountStatusAll['DEACTIVE']?.total || 0) +
              (this.accountStatusAll['ACTIVE']?.total || 0) +
              (this.accountStatusAll['RESTRICTED']?.total || 0);
            this.isLoading = false;
          }
        });
    } else {
      this._reportStaticsServices
        .getModelFilteration(form.value)
        .subscribe((res) => {
          if (
            form.value.model == 'location' ||
            form.value.model == 'update customer meal' ||
            form.value.model == 'accounts_status' ||
            form.value.model == 'accounts_status_from_to'
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
  }
  openAccountStatusAllModal(branch: string, data: AccountStatusItem[]) {
    this.branchData = data.filter((item) => item.branch === branch);
    this.openBrachDetailModal = true;
  }

  openModalDetails(model: string, type: string, customerType: string = '') {
    if (type == 'social_media') {
      if (model == 'cs_s') {
        if (customerType == 'new') {
          this.title = 'Customer Services New';
          this.subscriptionsData =
            this.newLeadData?.CustomerServices_subscribeSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'Customer Services Renew';
          this.subscriptionsData =
            this.newLeadData?.CustomerServices_subscribeSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'Customer Services Subscription';
          this.subscriptionsData =
            this.newLeadData?.CustomerServices_subscribeSubscriptions || [];
        }
        this.exportLink =
          this.newLeadData?.CustomerServices_subscribeSubscriptions_export ||
          '';
      } else if (model == 'cs_un') {
        if (customerType == 'new') {
          this.title = 'Customer Services New';
          this.subscriptionsData =
            this.newLeadData?.CustomerServices_unSubscribeSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'Customer Services Renew';
          this.subscriptionsData =
            this.newLeadData?.CustomerServices_unSubscribeSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'Customer Services un Subscription';
          this.subscriptionsData =
            this.newLeadData?.CustomerServices_unSubscribeSubscriptions || [];
        }

        this.exportLink =
          this.newLeadData?.CustomerServices_unSubscribeSubscriptions_export ||
          '';
      } else if (model == 'c_s') {
        if (customerType == 'new') {
          this.title = 'Clinic Subscription New';
          this.subscriptionsData =
            this.newLeadData?.Clinic_subscribeSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'Clinic Subscription Renew';
          this.subscriptionsData =
            this.newLeadData?.Clinic_subscribeSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'Clinic Subscription';
          this.subscriptionsData =
            this.newLeadData?.Clinic_subscribeSubscriptions || [];
        }

        this.exportLink =
          this.newLeadData?.Clinic_subscribeSubscriptions_export || '';
      } else {
        // c_un
        if (customerType == 'new') {
          this.title = 'Clinic Un Subscription New';
          this.subscriptionsData =
            this.newLeadData?.Clinic_unSubscribeSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'Clinic Un Subscription Renew';
          this.subscriptionsData =
            this.newLeadData?.Clinic_unSubscribeSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'Clinic Un Subscription';
          this.subscriptionsData =
            this.newLeadData?.Clinic_unSubscribeSubscriptions || [];
        }

        this.exportLink =
          this.newLeadData?.Clinic_unSubscribeSubscriptions_export || '';
      }
      this.modelDetailTitle = 'social_media';
    } else if (type == 'new_lead') {
      this.title =
        model == 'social'
          ? 'Social Media'
          : model == 'calls'
          ? 'Calls'
          : 'WhatsApp';
      if (model == 'social') {
        this.requestsData = this.filterDataPipe.transform(
          this.newLeadData.SocialMedia || [],
          customerType
        );
        this.exportLink = this.newLeadData?.SocialMedia_export || '';
      } else if (model == 'calls') {
        this.requestsData = this.filterDataPipe.transform(
          this.newLeadData.CallRequests || [],
          customerType
        );
        this.exportLink = this.newLeadData?.CallRequests_export || '';
      } else {
        this.requestsData = this.filterDataPipe.transform(
          this.newLeadData.WhatsappRequests || [],
          customerType
        );
        this.exportLink = this.newLeadData?.WhatsappRequests_export || '';
      }
      this.modelDetailTitle = 'new_lead';
    } else {
      if (model == 'branches') {
        if (customerType == 'new') {
          this.title = 'Branches New';
          this.subscriptionsData =
            this.newLeadData?.BranchSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'Branches Renew';
          this.subscriptionsData =
            this.newLeadData?.BranchSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'Branches';
          this.subscriptionsData = this.newLeadData?.BranchSubscriptions || [];
        }
        this.exportLink = this.newLeadData?.BranchSubscriptions_export || '';
      } else if (model == 'calls') {
        if (customerType == 'new') {
          this.title = 'Call New';
          this.subscriptionsData =
            this.newLeadData?.CallSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'Call Renew';
          this.subscriptionsData =
            this.newLeadData?.CallSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'Call Subscription';
          this.subscriptionsData = this.newLeadData?.CallSubscriptions || [];
          this.exportLink = this.newLeadData?.CallSubscriptions_export || '';
        }
      } else if (model == 'whatsapp') {
        if (customerType == 'new') {
          this.title = 'whatsapp New';
          this.subscriptionsData =
            this.newLeadData?.WhatsappSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'whatsapp Renew';
          this.subscriptionsData =
            this.newLeadData?.WhatsappSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'whatsapp Subscription';
          this.subscriptionsData =
            this.newLeadData?.WhatsappSubscriptions || [];
          this.exportLink =
            this.newLeadData?.WhatsappSubscriptions_export || '';
        }
        this.exportLink = this.newLeadData?.WhatsappSubscriptions_export || '';
      } else {
        // c_un
        if (customerType == 'new') {
          this.title = 'online New';
          this.subscriptionsData =
            this.newLeadData?.OnlineSubscriptions?.filter(
              (item) => item.customer_type == 'new'
            ) || [];
        } else if (customerType == 'renew') {
          this.title = 'online Renew';
          this.subscriptionsData =
            this.newLeadData?.OnlineSubscriptions?.filter(
              (item) => item.customer_type == 'renew'
            ) || [];
        } else {
          this.title = 'online Subscription';
          this.subscriptionsData = this.newLeadData?.OnlineSubscriptions || [];
        }
        this.exportLink = this.newLeadData?.OnlineSubscriptions_export || '';
      }
      this.modelDetailTitle = 'new_subscriptions';
    }

    this.openDiffModal = true;
  }
  getStatusAsString(status: any) {
    if (status == '0') {
      return 'De Active';
    } else if (status == '1') {
      return 'Active';
    } else {
      return 'Restricted';
    }
  }
  export(url: string) {
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = url;
    link.click();
  }
  onSelectDateRange(event: Calendar) {
    if (this.filterForm.value.date[1] != null) {
      event.hideOverlay();
    }
  }

  openModalViewMobileDetails(mobile: any) {
    this._UserServices.sendMobileData({ value: mobile });
  }
  sort(event: any, dataSorting: any) {
    this.appService.sort(event, dataSorting);
  }
}
