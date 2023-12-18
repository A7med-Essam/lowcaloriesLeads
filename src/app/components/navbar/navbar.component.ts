import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
    private _SubscriptionsService: SubscriptionsService
  ) {}

  notificationModal: boolean = false;
  customerModal: boolean = false;
  phoneModal: boolean = false;

  ngOnInit() {
    this._AuthService.currentUser.subscribe((data) => {
      if (data != null) {
        this.getNotifications();
        this.getPermission();
      } else {
        this.isLogin = false;
      }
    });
  }

  searchPermission: boolean = false;
  getPermission() {
    this.searchPermission =
      this._GuardService.getPermissionStatus('search_application');
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
  getCustomerModels(mobile: any) {
    if (mobile != '') {
      this.resetAllModels();
      this._UsersService.getCustomerModels(mobile.value).subscribe((res) => {
        if (res.status == 1) {
          this.phoneModal = false;
          this.customerModal = true;
          this.customerModels = res.data;
          mobile.value = null;
          this._SubscriptionsService
            .filterSubscriptions(1, {
              Mobile_no: res.data.info.phone_number,
              sub_from: 'web',
              paginate: 10,
            })
            .subscribe((res) => {
              this.filter =this.paymentWeb= res.data.data;
            });

          this._SubscriptionsService
            .getSystemSybscriptions(res.data.info.phone_number)
            .subscribe((res) => {
              this.system = res;
            });
        }
      });
    }
  }
  filter: any;
  @ViewChild(TabView) tabView!: TabView;
  getModelDetails(event: any, client: any = this.customerModels.info) {
    this.filter = [];
    let model = this.tabView.tabs[event.index].header;
    model = model.split(' (')[0];
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
    }
  }

  viewTab(model: string, client: any = this.customerModels.info) {
    switch (model) {
      case 'Clinic':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: client.phone_number,
          full_plan_name: 'Appointment',
        });
        break;
      case 'refunds':
        this.redirectWithFilter('refund', 'refund_filter', {
          mobile: client.phone_number,
        });
        break;
      case 'targets':
        this.redirectWithFilter('target', 'target_filter', {
          client_number: client.phone_number,
        });
        break;
      case 'leads':
        this.redirectWithFilter('leads', 'leads_filter', {
          customer_mobile: client.phone_number,
        });
        break;
      case 'issues':
        this.redirectWithFilter('complaints/show', 'complaints_filter', {
          c_mobile: client.phone_number,
        });
        break;
      case 'dataAnalytics':
        this.redirectWithFilter('analysis', 'analysis_filter', {
          mobile: client.phone_number,
        });
        break;
      case 'calls':
        this.redirectWithFilter('calls', 'calls_filter', {
          customer_phone: client.phone_number,
        });
        break;
      case 'addresses':
        break;
      case 'webSubscription':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: client.phone_number,
          program_id: 'web',
          // sub_from: 'web',
        });
        break;
      case 'mobileSubscription':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: client.phone_number,
          program_id: 'mobile',
          // sub_from: 'mobile',
        });
        break;
      case 'paymentLink':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: client.phone_number,
          // sub_from: 'payment link',
          program_id: '50',
        });
        break;
      case 'branches':
        this.redirectWithFilter('subscriptions', 'subscriptions_filter', {
          Mobile_no: client.phone_number,
          program_id: 'mobile',
        });
        break;
      case 'Dislikes':
        this.redirectWithFilter('dislike', 'dislike_filter', {
          mobile: client.phone_number,
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

  leads: any[] = [];
  loadLeads(client: any) {
    if (this.leads.length) {
      this.filter = this.leads;
    } else {
      this._SurveyService
      .filterLeads(1, {
        customer_mobile: client.phone_number,
        paginate: 10,
      })
      .subscribe((res) => {
        this.filter = this.leads= res.data.data;
      });
    }
  }
  issues: any[] = [];
  loadIssues(client: any) {
    if (this.issues.length) {
      this.filter = this.issues;
    } else {
      this._ComplaintsService
      .filterComplaints(1, { c_mobile: client.phone_number, paginate: 10 })
      .subscribe((res) => {
        this.filter = this.issues= res.data.data;
      });
    }
  }
  refunds: any[] = [];
  loadRefund(client: any) {
    if (this.refunds.length) {
      this.filter = this.refunds;
    } else {
      this._RefundService
        .filterRefund(1, { mobile: client.phone_number, paginate: 10 })
        .subscribe((res) => {
          this.filter= this.refunds = res.data.data;
        });
    }
  }
  paymentlink: any[] = [];
  loadPaymentlink(client: any) {
    if (this.paymentlink.length) {
      this.filter = this.paymentlink;
    } else {
      this._SubscriptionsService
      .filterSubscriptions(1, {
        Mobile_no: client.phone_number,
        program_id: '50',
        paginate: 10,
      })
      .subscribe((res) => {
        this.filter = this.paymentlink= res.data.data;
      });
    }
  }
  paymentWeb: any[] = [];
  loadPaymentWeb(client: any) {
    if (this.paymentWeb.length) {
      this.filter = this.paymentWeb;
    } else {
      this._SubscriptionsService
      .filterSubscriptions(1, {
        Mobile_no: client.phone_number,
        program_id: 'web',
        paginate: 10,
      })
      .subscribe((res) => {
        this.filter = this.paymentWeb= res.data.data;
      });
    }
  }
  paymentMobile: any[] = [];
  loadPaymentMobile(client: any) {
    if (this.paymentMobile.length) {
      this.filter = this.paymentMobile;
    } else {
      this._SubscriptionsService
      .filterSubscriptions(1, {
        Mobile_no: client.phone_number,
        program_id: 'mobile',
        paginate: 10,
      })
      .subscribe((res) => {
        this.filter = this.paymentMobile= res.data.data;
      });
    }
  }
  clinics: any[] = [];
  loadClinic(client: any) {
    if (this.clinics.length) {
      this.filter = this.clinics;
    } else {
      this._SubscriptionsService
        .filterSubscriptions(1, {
          Mobile_no: client.phone_number,
          full_plan_name: 'Appointment',
          paginate: 10,
        })
        .subscribe((res) => {
          this.filter  = this.clinics= res.data.data;
        });
    }
  }
  targets: any[] = [];
  loadTargets(client: any) {
    if (this.targets.length) {
      this.filter = this.targets;
    } else {
      this._AgentTargetService
        .filterTargets(1, {
          client_number: client.phone_number,
          paginate: 10,
        })
        .subscribe((res) => {
          this.filter  = this.targets= res.data.data;
        });
    }
  }
  analytics: any[] = [];
  loadAnalytics(client: any) {
    if (this.analytics.length) {
      this.filter = this.analytics;
    } else {
      this._AnalysisService
      .filterAnalytics(1, { mobile: client.phone_number, paginate: 10 })
      .subscribe((res) => {
        this.filter = this.analytics= res.data.data;
      });
    }
  }
  calls: any[] = [];
  loadCalls(client: any) {
    if (this.calls.length) {
      this.filter = this.calls;
    } else {
      this._CallsService
      .filterCalls(1, { customer_phone: client.phone_number, paginate: 10 })
      .subscribe((res) => {
        this.filter = this.calls= res.data.data;
      });
    }
  }
  dislikes: any[] = [];
  loadDislikes(client: any) {
    if (this.dislikes.length) {
      this.filter = this.dislikes;
    } else {
      this._DislikeService
      .filterDislikes(1, { mobile: client.phone_number, paginate: 10 })
      .subscribe((res) => {
        this.filter = this.dislikes = res.data.data;
      });
    }
  }

  resetAllModels(){
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
  }
}
