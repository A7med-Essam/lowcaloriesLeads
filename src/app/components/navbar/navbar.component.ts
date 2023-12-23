import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TabView } from 'primeng/tabview';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { AnalysisService } from 'src/app/services/analysis.service';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { CallsService } from 'src/app/services/calls.service';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { GuardService } from 'src/app/services/guard.service';
import { LocalService } from 'src/app/services/local.service';
import { PusherService } from 'src/app/services/pusher.service';
import { RefundService } from 'src/app/services/refund.service';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';
import { SurveyService } from 'src/app/services/survey.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(
    private _AppService: AppService,
    private _GuardService: GuardService,
    private _AuthService: AuthService,
    private _PusherService: PusherService,
    private _SurveyService: SurveyService,
    private _ComplaintsService: ComplaintsService,
    private _DislikeService: DislikeService,
    private _RefundService: RefundService,
    private _AgentTargetService: AgentTargetService,
    private _CallsService: CallsService,
    private _Router: Router,
    private _UsersService: UsersService,
    private _LocalService: LocalService,
    private _AnalysisService: AnalysisService,
    private _SubscriptionsService: SubscriptionsService,
    private _MessageService:MessageService
  ) {}

  notificationModal: boolean = false;
  customerModal: boolean = false;
  phoneModal: boolean = false;

  ngOnInit() {
    this._AuthService.currentUser.subscribe((data) => {
      if (data != null) {
        this.getNotifications();
        // this.getPermission();
      } else {
        this.isLogin = false;
      }
    });
  }

  uploadPermission: boolean = true;
  searchPermission: boolean = true;
  getPermission() {
    // this.searchPermission =
    //   this._GuardService.getPermissionStatus('search_application');
    this.uploadPermission =
      this._GuardService.getPermissionStatus('uploadPermission');
  }

  isCollapsed = true;

  toggleSidebarPin() {
    this._AppService.toggleSidebarPin();
  }
  toggleSidebar() {
    this._AppService.toggleSidebar();
  }

  // ================================================================ NOTIFICATIONS ================================================================
  isLogin: boolean = false;
  hasNotification: boolean = false;
  audioPlayer!: HTMLAudioElement;
  notifications: any[] = [];
  currentNotification: any;
  getNotifications() {
    if (this._GuardService.getUser()) {
      this.isLogin = true;
      this._PusherService.pusherEventLeadData.subscribe((res) => {
        if (res) {
          this.processNotification(res);
        }
      });
    } else {
      this.isLogin = false;
    }
  }

  private processNotification(res: any) {
    if (res) {
      res.agent_assigned_ids = res.agent_assigned_ids.map((e: string) =>
        Number(e)
      );
      this.hasNotification = res.agent_assigned_ids.includes(
        Number(this._GuardService.getUser().id)
      );
      if (this.hasNotification) {
        this.notificationModal = true;
        this.currentNotification = res;
        this.notifications = res?.notifications;
        this.playNotificationSound();
      }
    }
  }

  private playNotificationSound() {
    this.audioPlayer = new Audio();
    this.audioPlayer.src = '../../../assets/notification.mp3';
    this.audioPlayer.play();
  }

  toggleNotifications() {
    this.hasNotification = !this.hasNotification;
    this.getAllNotifications();
  }

  getAllNotifications() {
    this._PusherService.notifications().subscribe({
      next: (res) => {
        this.notifications = res.data;
      },
    });
  }

  updateNotifications(notification: any) {
    this._PusherService.updateNotifications(notification.id).subscribe({
      next: (res) => {
        this.notifications = this.notifications.map((n) => {
          if (n.id === notification.id) {
            return res.data;
          }
          return notification;
        });
        this.redirect(notification);
      },
    });
  }

  redirect(notification: any) {
    switch (notification.type) {
      case 'lead':
        // this._SurveyService.leadId.next(notification.model_id);
        this._Router.navigate(['leads']);
        break;
      case 'call':
        // this._CallsService.call.next(notification.model_id);
        this._Router.navigate(['calls']);
        break;
      case 'target':
        // this._AgentTargetService.target.next(notification.model_id);
        this._Router.navigate(['target']);
        break;
      case 'refund':
        // this._RefundService.refund.next(notification.model_id);
        this._Router.navigate(['refund']);
        break;
      case 'dislike':
        // this._DislikeService.dislikeDetails.next(notification.model_id);
        this._Router.navigate(['leads']);
        break;
      default:
        return;
    }
  }

  // =================================================================================================
  openSearchModal() {
    if (this.searchPermission) {
      this.phoneModal = true;
    }
  }
  customerModels: any;
  system: any[] = [];
  pickup: any[] = [];
  CHSubscriptions: any;
  currentCustomerMobile: any;
  currentModel: string = '';
  getCustomerModels(mobile: any) {
    if (mobile != '') {
      this.resetAllModels();
      this.tabOption = 0;
      this._UsersService.getCustomerModels(mobile.value).subscribe((res) => {
        if (res.status == 1) {
          this.currentCustomerMobile = mobile.value;
          this.phoneModal = false;
          this.customerModal = true;
          this.customerModels = res.data;
          mobile.value = null;
          this._SubscriptionsService
            .filterSubscriptions(1, {
              Mobile_no: this.currentCustomerMobile,
              sub_from: 'web',
              paginate: 10,
            })
            .subscribe((res) => {
              this.filter = this.paymentWeb = res.data.data;
            });

          this._SubscriptionsService
            .getSystemSybscriptions(this.currentCustomerMobile)
            .subscribe((res) => {
              this.system = res;
            });

          this._SubscriptionsService
            .getSystemPickup(this.currentCustomerMobile)
            .subscribe((res) => {
              if (res) {
                this.pickup = res.data.customerPlan;
              } else {
                this.pickup = [];
              }
            });

          this._SubscriptionsService
            .getCustomerCHSubscriptions(this.currentCustomerMobile)
            .subscribe((res) => {
              this.CHSubscriptions = res.data;
            });
        }
      });
    }
  }
  filter: any;
  @ViewChild(TabView) tabView!: TabView;
  getModelDetails(event: any, client: any = this.currentCustomerMobile) {
    this.filter = [];
    let model = this.tabView.tabs[event.index].header;
    model = model.split(' (')[0];
    this.currentModel = model;
    switch (model) {
      case 'Clinic':
        this.loadClinic(client);
        break;
      case 'refunds':
        this.loadRefund(client);
        break;
      case 'targets':
        this.loadTargets(client);
        break;
      case 'leads':
        this.loadLeads(client);
        break;
      case 'issues':
        this.loadIssues(client);
        break;
      case 'dataAnalytics':
        this.loadAnalytics(client);
        break;
      case 'calls':
        this.loadCalls(client);
        break;
      case 'webSubscription':
        this.loadPaymentWeb(client);
        break;
      case 'mobileSubscription':
        this.loadPaymentMobile(client);
        break;
      case 'Dislikes':
        this.loadDislikes(client);
        break;
      case 'paymentLink':
        this.loadPaymentlink(client);
        break;
      case 'systemSubscription':
        this.filter = this.system;
        break;
      case 'systemPickup':
        this.filter = this.pickup;
        break;
      case 'CHSubscriptions':
        this.filter = this.CHSubscriptions;
        break;
    }
  }

  viewTab(model: string, client: any = this.customerModels.info) {
    switch (model) {
      case 'Clinic':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: this.currentCustomerMobile,
          full_plan_name: 'Appointment',
        });
        break;
      case 'refunds':
        this.redirectWithFilter('refund', 'refund_filter', {
          mobile: this.currentCustomerMobile,
        });
        break;
      case 'targets':
        this.redirectWithFilter('target', 'target_filter', {
          client_number: this.currentCustomerMobile,
        });
        break;
      case 'leads':
        this.redirectWithFilter('leads', 'leads_filter', {
          customer_mobile: this.currentCustomerMobile,
        });
        break;
      case 'issues':
        this.redirectWithFilter('complaints/show', 'complaints_filter', {
          c_mobile: this.currentCustomerMobile,
        });
        break;
      case 'dataAnalytics':
        this.redirectWithFilter('analysis', 'analysis_filter', {
          mobile: this.currentCustomerMobile,
        });
        break;
      case 'calls':
        this.redirectWithFilter('calls', 'calls_filter', {
          customer_phone: this.currentCustomerMobile,
        });
        break;
      case 'addresses':
        break;
      case 'webSubscription':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: this.currentCustomerMobile,
          program_id: 'web',
          // sub_from: 'web',
        });
        break;
      case 'mobileSubscription':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: this.currentCustomerMobile,
          program_id: 'mobile',
          // sub_from: 'mobile',
        });
        break;
      case 'paymentLink':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: this.currentCustomerMobile,
          // sub_from: 'payment link',
          program_id: '50',
        });
        break;
      case 'branches':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: this.currentCustomerMobile,
          program_id: 'mobile',
        });
        break;
      case 'Dislikes':
        this.redirectWithFilter('dislike', 'dislike_filter', {
          mobile: this.currentCustomerMobile,
        });
        break;
    }
  }

  redirectWithFilter(returnUrl: string, filterKey: string, filter: any): void {
    this._LocalService.setJsonValue('returnUrl', returnUrl);
    this._LocalService.setJsonValue(filterKey, filter);
    const urlTree = this._Router.createUrlTree([returnUrl]);
    const url = this._Router.serializeUrl(urlTree);
    // window.open(url, '_blank',"width= 1015 , height= 800");
    window.open('/#' + url, '_blank');
    setTimeout(() => {
      this._LocalService.removeItem('returnUrl');
      this._LocalService.removeItem(filterKey);
    }, 1000);
  }

  // ================================================================LOAD MODELS====================================================================
  loadingTable: boolean = false;
  tabOption: number = 0;
  leads: any[] = [];
  loadLeads(client: any) {
    if (this.leads.length) {
      this.filter = this.leads;
    } else {
      this.loadingTable = true;
      this._SurveyService
        .filterLeads(1, {
          customer_mobile: client,
          paginate: 10,
        })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'leads') {
            this.filter = this.leads = res.data.data;
          }
        });
    }
  }
  issues: any[] = [];
  loadIssues(client: any) {
    if (this.issues.length) {
      this.filter = this.issues;
    } else {
      this.loadingTable = true;
      this._ComplaintsService
        .filterComplaints(1, { c_mobile: client, paginate: 10 })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'issues') {
            this.filter = this.issues = res.data.data;
          }
        });
    }
  }
  refunds: any[] = [];
  loadRefund(client: any) {
    if (this.refunds.length) {
      this.filter = this.refunds;
    } else {
      this.loadingTable = true;
      this._RefundService
        .filterRefund(1, { mobile: client, paginate: 10 })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'refunds') {
            this.filter = this.refunds = res.data.data;
          }
        });
    }
  }
  paymentlink: any[] = [];
  loadPaymentlink(client: any) {
    if (this.paymentlink.length) {
      this.filter = this.paymentlink;
    } else {
      this.loadingTable = true;
      this._SubscriptionsService
        .filterSubscriptions(1, {
          Mobile_no: client,
          program_id: '50',
          paginate: 10,
        })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'paymentLink') {
            this.filter = this.paymentlink = res.data.data;
          }
        });
    }
  }
  paymentWeb: any[] = [];
  loadPaymentWeb(client: any) {
    if (this.paymentWeb.length) {
      this.filter = this.paymentWeb;
    } else {
      this.loadingTable = true;
      this._SubscriptionsService
        .filterSubscriptions(1, {
          Mobile_no: client,
          program_id: 'web',
          paginate: 10,
        })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'webSubscription') {
            this.filter = this.paymentWeb = res.data.data;
          }
        });
    }
  }
  paymentMobile: any[] = [];
  loadPaymentMobile(client: any) {
    if (this.paymentMobile.length) {
      this.filter = this.paymentMobile;
    } else {
      this.loadingTable = true;
      this._SubscriptionsService
        .filterSubscriptions(1, {
          Mobile_no: client,
          program_id: 'mobile',
          paginate: 10,
        })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'mobileSubscription') {
            this.filter = this.paymentMobile = res.data.data;
          }
        });
    }
  }
  clinics: any[] = [];
  loadClinic(client: any) {
    if (this.clinics.length) {
      this.filter = this.clinics;
    } else {
      this.loadingTable = true;
      this._SubscriptionsService
        .filterSubscriptions(1, {
          Mobile_no: client,
          full_plan_name: 'Appointment',
          paginate: 10,
        })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'Clinic') {
            this.filter = this.clinics = res.data.data;
          }
        });
    }
  }
  targets: any[] = [];
  loadTargets(client: any) {
    if (this.targets.length) {
      this.filter = this.targets;
    } else {
      this.loadingTable = true;
      this._AgentTargetService
        .filterTargets(1, {
          client_number: client,
          paginate: 10,
        })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'targets') {
            this.filter = this.targets = res.data.data;
          }
        });
    }
  }
  analytics: any[] = [];
  loadAnalytics(client: any) {
    if (this.analytics.length) {
      this.filter = this.analytics;
    } else {
      this.loadingTable = true;
      this._AnalysisService
        .filterAnalytics(1, { mobile: client, paginate: 10 })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'dataAnalytics') {
            this.filter = this.analytics = res.data.data;
          }
        });
    }
  }
  calls: any[] = [];
  loadCalls(client: any) {
    if (this.calls.length) {
      this.filter = this.calls;
    } else {
      this.loadingTable = true;
      this._CallsService
        .filterCalls(1, { customer_phone: client, paginate: 10 })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'calls') {
            this.filter = this.calls = res.data.data;
          }
        });
    }
  }
  dislikes: any[] = [];
  loadDislikes(client: any) {
    if (this.dislikes.length) {
      this.filter = this.dislikes;
    } else {
      this.loadingTable = true;
      this._DislikeService
        .filterDislikes(1, { mobile: client, paginate: 10 })
        .subscribe((res) => {
          this.loadingTable = false;
          if (this.currentModel == 'Dislikes') {
            this.filter = this.dislikes = res.data.data;
          }
        });
    }
  }

  resetAllModels() {
    this.leads = [];
    this.issues = [];
    this.refunds = [];
    this.paymentlink = [];
    this.paymentWeb = [];
    this.paymentMobile = [];
    this.clinics = [];
    this.targets = [];
    this.analytics = [];
    this.calls = [];
    this.dislikes = [];
    this.system = [];
    this.pickup = [];
    this.CHSubscriptions = null;
  }

  // ===============================================
  showCustomerAdress : boolean  = false;
  showCustomerPhones : boolean  = false;
  showCustomerSub : boolean  = false;

  // ===========================================================================UPLOAD==================================================================
  isLoading: boolean = false;
  uploadModal: boolean = false;
  // getSample() {
  //   if (this.uploadPermission) {
  //     this._SubscriptionsService.downloadSampleCustomerStatics().subscribe((res) => {
  //       const link = document.createElement('a');
  //       link.target = '_blank';
  //       link.href = res.data;
  //       link.click();
  //     });
  //   }
  // }

  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }


  onFileSelected(event: any) {
    if (this.uploadPermission) {
      const file: File = event.target.files[0];
      if (file) {
        this.isLoading = true;
        let f: File = this.getFormData({ file: file }) as any;
        this._SubscriptionsService.uploadCustomerStatics(f).subscribe({
          next: (res) => {
            this.uploadModal = false;
            this.isLoading = false;
            this.handleUploadSuccess(res.data)
          },
          error: (err) => {
            this.uploadModal = false;
            this.isLoading = false;
          }
        });
        this.uploadModal = false;
      }
    }
  }

  displayUploadModal() {
    if (this.uploadPermission) {
      this.uploadModal = true;
    }
  }

  private handleUploadSuccess(data: any) {
    this._MessageService.add({
      severity: 'success',
      summary: 'Upload File',
      detail: 'File Uploaded Successfully',
    });
    const link = document.createElement('a');
    link.target = '_blank';
    link.download = "";
    link.href = data;
    link.click();
  }
}
