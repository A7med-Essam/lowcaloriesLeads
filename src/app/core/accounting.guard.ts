import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccountingGuard implements CanActivate {

  constructor(private _AuthService: AuthService, private _Router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let role: string = '';
    this._AuthService.currentUser.subscribe((res: any) => {
      role = res?.role;
    });
    if (role == 'accounting') {
      this._Router.navigate(['/home']);
      return false;
    } else {
      return true;
    } 
  }
  
}
