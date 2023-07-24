import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { GuardService } from '../services/guard.service';
import { LocalService } from '../services/local.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(
    private _GuardService: GuardService,
    private _MessageService: MessageService,
    private _AuthService: AuthService,
    private _LocalService: LocalService,
    private _Router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this._GuardService.getUser()) {
      if (this._GuardService.isSuperAdmin()) return true;
      if (route.data.permission[0] == 'show_home') return true;
      if (this._GuardService.getPermissionStatus(route.data.permission[0]))
        return true;
      this._Router.navigate(['./home']);
      this._MessageService.add({
        severity: 'warn',
        summary: 'Unauthorized',
        detail: "You don't have permission to access this page",
      });
      return false;
    } else {
      this._AuthService.returnUrl.next(state.url);
      this._Router.navigate(['/login']);
      return false;
    }
  }
}
