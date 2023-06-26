import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
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
  userId:number = 0;
  role:string = ''
  constructor(
    private _AuthService: AuthService,
    private _PusherService: PusherService,
    private _SurveyService:SurveyService,
  ) {
    _AuthService.currentUser.subscribe((data) => {
      if (data != null) {
        this.isLogin = true;
        this.country = data.country;
        data.role == 'super_admin' || data.role == '2'
          ? (this.isSuperAdmin = true)
          : (this.isSuperAdmin = false);
        this.userId = data.id
        this.role = data.role
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
        const [user] = res.data.filter((e:any)=> e?.id == this.userId);
        this.currentUserName = user
      },
    });
  }

}
