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
  currentUser: BehaviorSubject<User|null> = new BehaviorSubject<User|null>(null);
  returnUrl: BehaviorSubject<any> = new BehaviorSubject<any>(null);
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

  signIn(signInData: {email:string,password:string}): Observable<{
    status:  number;
    message: string;
    data:    User;
  }> {
    return this._ApiConfigService.postReq3('loginAgents', signInData);
  }

  saveUser(data: User) {
    let userData: User = data
    this._LocalService.setJsonValue('userInfo_oldLowCalories', userData);
    this.currentUser.next(userData);
  }

  logOut() {
    this._Router.navigate(['/login']);
    this.currentUser.next(null);
    this._LocalService.removeItem('userInfo_oldLowCalories');
  }
}

export interface User {
  id:           number;
  status:       string;
  team:         string;
  branch_id:    number;
  role:         number;
  role_name:    string;
  agent_id:     number;
  name:         string;
  email:        string;
  agent_email:  string;
  created_at:   Date;
  updated_at:   Date;
  access_token: string;
  permissions:  Permission[];
}

export interface Permission {
  id:         number;
  agent_id:   number;
  permission: string;
  created_at: Date;
  updated_at: Date;
}