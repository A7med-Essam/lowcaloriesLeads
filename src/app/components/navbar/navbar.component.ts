import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { LocalService } from 'src/app/services/local.service';
import { PusherService } from 'src/app/services/pusher.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLogin:boolean = false;
  hasNotification:boolean = false;
  audioPlayer!: HTMLAudioElement;
  LeadNotification:any = null;

  constructor(private _AppService: AppService, private _AuthService:AuthService,
    private _PusherService:PusherService,
    private _LocalService:LocalService
    ) { 
    _AuthService.currentUser.subscribe((data)=>{
      if(data != null)
      {
        this.isLogin = true;
        this._PusherService.pusherEventLeadData.subscribe(res=>{
          this.LeadNotification = res
          if (res) {
            res.agent_assigned_ids = res.agent_assigned_ids.map((e:string[])=>{
              return Number(e)
            })
            this.hasNotification = res.agent_assigned_ids.includes(Number(this._LocalService.getJsonValue('userInfo_oldLowCalories')?.id))
            this.audioPlayer = new Audio();
            this.audioPlayer.src = '../../../assets/notification.mp3';
            this.audioPlayer.play();
          }
        })
      }
      else
      {
        this.isLogin = false;
      }
    })
  }

  isCollapsed = true;
  leadData:any;
  assignedUsersLeads:number[]=[]
  ngOnInit() {}

  toggleSidebarPin() {
    this._AppService.toggleSidebarPin();
  }
  toggleSidebar() {
    this._AppService.toggleSidebar();
  }
  closeNotify(){
    this.hasNotification = false;
  }

}
