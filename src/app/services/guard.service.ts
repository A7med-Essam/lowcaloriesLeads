import { Injectable } from '@angular/core';
import { User } from './auth.service';
import { LocalService } from './local.service';

@Injectable({
  providedIn: 'root',
})
export class GuardService {
  constructor(private _LocalService: LocalService) {}

  getUser(): User {
    return this._LocalService.getJsonValue('userInfo_oldLowCalories');
  }

  getPermissionStatus(permission: string): boolean {
    if (this.getUser() == null) {
      return false;
    }
    if (this.isSuperAdmin()) {
      return true;
    }
    const userPermissions = this.getUser().permissions;
    return userPermissions.some((p) => p.permission === permission);
  }

  isSuperAdmin(): boolean {
    return this.getUser().role_name === 'super_admin';
  }
}
