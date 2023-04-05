import { Injectable } from '@angular/core';
import { LocalService } from './local.service';

@Injectable({
  providedIn: 'root',
})
export class GuardService {
  user: any;
  constructor(private _LocalService: LocalService) {
    this.getUser();
  }

  getUser() {
    if (this._LocalService.getJsonValue('userInfoManager') != null) {
      this.user = this._LocalService.getJsonValue('userInfoManager');
    }
  }

  getPermissionStatus(permission: string) {
    this.getUser();
    let status: boolean = false;
    if (!this.isSuperAdmin()) {
      if (this.user?.permissions.length > 0) {
        this.user.permissions.includes(permission)
          ? (status = true)
          : (status = false);
      }
    } else {
      status = true;
    }
    return status;
  }

  isSuperAdmin() {
    return this.user?.role == 'super_admin' || this.user?.role == '2'
      ? true
      : false;
  }

  // Dashboard Permissions
  hasDashboardPermission_Read() {
    return this.getPermissionStatus('read_dashboard');
  }

  hasDashboardPermission_Create() {
    return this.getPermissionStatus('create_dashboard');
  }

  hasDashboardPermission_Update() {
    return this.getPermissionStatus('update_dashboard');
  }

  hasDashboardPermission_Delete() {
    return this.getPermissionStatus('delete_dashboard');
  }

  // Reports Permissions
  hasReportsPermission_Read() {
    return this.getPermissionStatus('read_reports');
  }

  // PaymentLink Permissions
  hasPaymentLinkPermission_Read() {
    return this.getPermissionStatus('read_paymentLink');
  }
}
