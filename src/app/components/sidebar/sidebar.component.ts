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
      this.isSuperAdmin = data.role_name === 'super_admin';
      this.getPermission();
    } else {
      this.isLogin = false;
    }
  }

  getPermission() {
    this.showLeadsPermission =
      this._GuardService.getPermissionStatus('show_leads');
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
    this.showDislikeReasonsPermission = this._GuardService.getPermissionStatus(
      'reasons_dislike'
    );
    this.showSubscriptionPermission = this._GuardService.getPermissionStatus(
      'show_subscription'
    );
    this.showRefundReasonsPermission = this._GuardService.getPermissionStatus('reasons_refund');
    this.showLeadReasonsPermission = this._GuardService.getPermissionStatus('reasons_leads');
    this.createPaymentLinkPermission = this._GuardService.getPermissionStatus('create_paymentlink');
    this.createPaymentBranchesPermission = this._GuardService.getPermissionStatus('createPayment_Branches');
    this.showGiftcodePermission = this._GuardService.getPermissionStatus('show_giftcode');
    this.showMailServicePermission = this._GuardService.getPermissionStatus('show_mailService');
  }

  logOut() {
    this._PusherService.firePusher(true);
    this._AuthService.logOut();
  }
}
