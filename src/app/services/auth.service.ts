import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { LocalService } from './local.service';
import { ApiConfigService } from 'src/app/core/api-config.service';

interface IUser {
  name: string;
  token: string;
  email: string;
  id: number;
  role: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  returnUrl!:string;
  constructor(
    private _Router: Router,
    private _LocalService: LocalService,
    private _ApiConfigService: ApiConfigService
  ) {
    if (this._LocalService.getJsonValue('userInfo_oldLowCalories') != null) {
      this.currentUser.next(
        this._LocalService.getJsonValue('userInfo_oldLowCalories')
      );
    }
  }

  signIn(signInData: any): Observable<any> {
    return this._ApiConfigService.postReq('loginAgents', signInData);
  }

  saveUser(data: any) {
    let userData: any = {
      id: data?.agent_id,
      role: data?.role,
    };
    this._LocalService.setJsonValue('userInfo_oldLowCalories', userData);
    this.currentUser.next(userData);
  }

  // saveUser2(data: any) {
  //   let userData: any = {
  //     name: data?.name,
  //     country: 'all',
  //     email: data?.email,
  //     id: data?.id,
  //     role: data?.my_role,
  //     permissions: data?.permissions ? data?.permissions : [],
  //     token: data?.access_token,
  //   };
  //   this._LocalService.setJsonValue('userInfo_oldLowCalories', userData);
  //   this.currentUser.next(userData);
  // }

  logOut() {
    this._Router.navigate(['/login']);
    this.currentUser.next(null);
    this._LocalService.removeItem('userInfo_oldLowCalories');
  }
}
