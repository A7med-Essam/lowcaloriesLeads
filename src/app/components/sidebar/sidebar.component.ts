import { Component, OnInit } from '@angular/core';
import { AuthService, User } from 'src/app/services/auth.service';
import { GuardService } from 'src/app/services/guard.service';
import { PusherService } from 'src/app/services/pusher.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isLogin: boolean = false;
  isSuperAdmin: boolean = true;
  user!: User;

  showLeadsPermission: boolean = false;
  showLogsPermission: boolean = false;
  showCallsPermission: boolean = false;
  showRefundPermission: boolean = false;
  showTargetPermission: boolean = false;
  showDislikePermission: boolean = false;
  createClinicPermission: boolean = false;
  showComplaintsPermission: boolean = false;
  showInputsPermission: boolean = false;
  assignCallsPermission: boolean = false;
  showDislikeReasonsPermission: boolean = false;
  showRefundReasonsPermission: boolean = false;
  showLeadReasonsPermission: boolean = false;
  createPaymentLinkPermission: boolean = false;
  createPaymentBranchesPermission: boolean = false;
  showSubscriptionPermission: boolean = false;
  showGiftcodePermission: boolean = false;
  showMailServicePermission: boolean = false;
  showReportStaticsServicePermission: boolean = false;
  showQueryModuleServicePermission: boolean = false;
  sendBulkWhatsappMessagePermission: boolean = false;
  trackBulkWhatsappMessagePermission: boolean = false;
  senderBulkWhatsappMessagePermission: boolean = false;
  templateBulkWhatsappMessagePermission: boolean = false;
  queryBulkWhatsappMessagePermission: boolean = false;
  showRedirectPermission: boolean = false;
  showUploadPermission: boolean = false;
  showAnalysisPermission: boolean = false;
  showEnquiryPermission: boolean = false;
  showOfferPermission: boolean = false;
  showCustomerPlanPermission: boolean = false;
  showReportPermission: boolean = false;
  showNotesPermission: boolean = false;
  manageAnalysisPermission: boolean = false;
  showInquiryNotePermission: boolean = false;
  showFranchisePermission: boolean = false;
  cronBulkWhatsappMessagePermission: boolean = false;
  mealItemsPermission: boolean = false;
  logActivityPermission: boolean = false;
  constructor(
    private _AuthService: AuthService,
    private _PusherService: PusherService,
    private _GuardService: GuardService
  ) {}

  ngOnInit() {
    this._AuthService.currentUser.subscribe((data) => {
      this.processUserData(data);
    });
  }

  private processUserData(data: any) {
    if (data != null) {
      this.user = data;
      this.isLogin = true;
      this.isSuperAdmin = data?.role_name === 'super_admin';
      this.getPermission();
    } else {
      this.isLogin = false;
    }
  }

  getPermission() {
    this.showLeadsPermission =
      this._GuardService.getPermissionStatus('show_leads');
    this.showLogsPermission =
      this._GuardService.getPermissionStatus('read_logs');
    this.showCallsPermission =
      this._GuardService.getPermissionStatus('show_calls');
    this.showRefundPermission =
      this._GuardService.getPermissionStatus('show_refund');
    this.showTargetPermission =
      this._GuardService.getPermissionStatus('show_target');
    this.showDislikePermission =
      this._GuardService.getPermissionStatus('show_dislike');
    this.createClinicPermission =
      this._GuardService.getPermissionStatus('create_clinic');
    this.showComplaintsPermission =
      this._GuardService.getPermissionStatus('show_complaints');
    this.showInputsPermission =
      this._GuardService.getPermissionStatus('show_inputs');
    this.assignCallsPermission =
      this._GuardService.getPermissionStatus('assign_calls');
    this.showDislikeReasonsPermission =
      this._GuardService.getPermissionStatus('reasons_dislike');
    this.showSubscriptionPermission =
      this._GuardService.getPermissionStatus('show_subscription');
    this.showRefundReasonsPermission =
      this._GuardService.getPermissionStatus('reasons_refund');
    this.showLeadReasonsPermission =
      this._GuardService.getPermissionStatus('reasons_leads');
    this.createPaymentLinkPermission =
      this._GuardService.getPermissionStatus('create_paymentlink');
    this.createPaymentBranchesPermission =
      this._GuardService.getPermissionStatus('createPayment_Branches');
    this.showGiftcodePermission =
      this._GuardService.getPermissionStatus('show_giftcode');
    this.showMailServicePermission =
      this._GuardService.getPermissionStatus('show_mailService');
    this.showReportStaticsServicePermission =
      this._GuardService.getPermissionStatus('show_reportStaticService');
    this.showQueryModuleServicePermission =
      this._GuardService.getPermissionStatus('show_queryModuleService');
    this.sendBulkWhatsappMessagePermission =
      this._GuardService.getPermissionStatus('send_bulkWhatsapp');
    this.trackBulkWhatsappMessagePermission =
      this._GuardService.getPermissionStatus('track_bulkWhatsapp');
    this.senderBulkWhatsappMessagePermission =
      this._GuardService.getPermissionStatus('sender_bulkWhatsapp');
    this.templateBulkWhatsappMessagePermission =
      this._GuardService.getPermissionStatus('template_bulkWhatsapp');
    this.queryBulkWhatsappMessagePermission =
      this._GuardService.getPermissionStatus('query_bulkWhatsapp');
    this.showRedirectPermission =
      this._GuardService.getPermissionStatus('show_redirect');
    this.showUploadPermission =
      this._GuardService.getPermissionStatus('show_docs');
    this.showAnalysisPermission =
      this._GuardService.getPermissionStatus('show_analysis');
    this.showEnquiryPermission =
      this._GuardService.getPermissionStatus('show_enquiry');
    this.showOfferPermission =
      this._GuardService.getPermissionStatus('show_offer');
    this.showCustomerPlanPermission = true;

    this.showReportPermission =
      this._GuardService.getPermissionStatus('show_AgentReport');
    this.showNotesPermission =
      this._GuardService.getPermissionStatus('show_notes');
    this.manageAnalysisPermission =
      this._GuardService.getPermissionStatus('manage_analysis');
    this.showInquiryNotePermission =
      this._GuardService.getPermissionStatus('showInquiry_notes');

    this.showFranchisePermission =
      this._GuardService.getPermissionStatus('show_franchise');

    // this._GuardService.getPermissionStatus('show_customerPlan');

    this.cronBulkWhatsappMessagePermission =
      this._GuardService.getPermissionStatus('cron_bulkWhatsapp');
    this.logActivityPermission =
      this._GuardService.getPermissionStatus('show_logs');
    this.mealItemsPermission =
      this._GuardService.getPermissionStatus('show_items');
  }

  logOut() {
    // this._PusherService.firePusher(true);
    this._AuthService.logOut();
  }
}
