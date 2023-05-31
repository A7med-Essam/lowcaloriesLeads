import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { PusherService } from 'src/app/services/pusher.service';

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
    private _PusherService: PusherService
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

  }

}
