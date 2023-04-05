import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/services/app.service';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLogin:boolean = false;

  constructor(private _AppService: AppService, private _AuthService:AuthService) { 
    _AuthService.currentUser.subscribe((data)=>{
      if(data != null)
      {
        this.isLogin = true;
      }
      else
      {
        this.isLogin = false;
      }
    })
  }

  isCollapsed = true;
  ngOnInit() {
  }

  toggleSidebarPin() {
    this._AppService.toggleSidebarPin();
  }
  toggleSidebar() {
    this._AppService.toggleSidebar();
  }

}
