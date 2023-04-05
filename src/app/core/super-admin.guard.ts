import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminGuard implements CanActivate {
  constructor(private _AuthService: AuthService, private _Router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let role: string = '';
    this._AuthService.currentUser.subscribe((res: any) => {
      role = res?.role;
    });
    if (role == 'super_admin') {
      return true;
    } else {
      this._Router.navigate(['/leads/show']);
      return false;
    }
  }
}
