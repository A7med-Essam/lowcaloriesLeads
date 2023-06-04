import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  NavigationExtras,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LocalService } from '../services/local.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private _AuthService: AuthService,
    private _Router: Router,
    private _LocalService: LocalService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this._AuthService.currentUser.getValue() != null) {
      return true;
    } else {
      // const returnUrl = state.url;
      // const navigationExtras: NavigationExtras = {
      //   queryParams: { returnUrl }
      // };
      // this._Router.navigate(['/login'], navigationExtras);

      // const returnUrl = state.url;
      this._AuthService.returnUrl = state.url;
      this._LocalService.setJsonValue('returnUrl', state.url);
      this._Router.navigate(['/login']);
      return false;
    }
  }
}
