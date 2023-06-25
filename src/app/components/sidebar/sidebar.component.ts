import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LocalService } from 'src/app/services/local.service';
import { PusherService } from 'src/app/services/pusher.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isLogin: boolean = false;
  isSuperAdmin: boolean = true;
  country: string = '';
  constructor(
    private _AuthService: AuthService,
    private _PusherService: PusherService,
    private _SurveyService:SurveyService,
    private _LocalService:LocalService
  ) {
    _AuthService.currentUser.subscribe((data) => {
      if (data != null) {
        this.isLogin = true;
        this.country = data.country;
        data.role == 'super_admin' || data.role == '2'
          ? (this.isSuperAdmin = true)
          : (this.isSuperAdmin = false);
      } else {
        this.isLogin = false;
      }
    });
  }

  logOut() {
    this._PusherService.firePusher(true);
    this._AuthService.logOut();
  }

  ngOnInit() {
    this.getAgents();
  }

  currentUserName: any;
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        const userId = this._LocalService.getJsonValue('userInfo_oldLowCalories').id
        const [user] = res.data.filter((e:any)=> e.id == userId);
        this.currentUserName = user
      },
    });
  }

}
