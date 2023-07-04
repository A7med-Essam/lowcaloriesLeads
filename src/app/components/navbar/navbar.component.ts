import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { GuardService } from 'src/app/services/guard.service';
import { PusherService } from 'src/app/services/pusher.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(
    private _AppService: AppService,
    private _GuardService: GuardService,
    private _AuthService: AuthService,
    private _PusherService: PusherService,
    private _SurveyService:SurveyService,
    private _Router:Router
  ) {}

  ngOnInit() {
    this._AuthService.currentUser.subscribe((data) => {
      if (data != null) {
        this.getNotifications();
      }
    });
  }

  isCollapsed = true;

  toggleSidebarPin() {
    this._AppService.toggleSidebarPin();
  }
  toggleSidebar() {
    this._AppService.toggleSidebar();
  }

  // ================================================================ NOTIFICATIONS ================================================================
  isLogin: boolean = false;
  hasNotification: boolean = false;
  audioPlayer!: HTMLAudioElement;
  LeadNotification: any = null;

  getNotifications() {
    if (this._GuardService.getUser()) {
      this.isLogin = true;
      this._PusherService.pusherEventLeadData.subscribe((res) => {
        this.processNotification(res);
      });
    } else {
      this.isLogin = false;
    }
  }

  private processNotification(res: any) {
    this.LeadNotification = res;
    if (res) {
      res.agent_assigned_ids = res.agent_assigned_ids.map((e: string) =>
        Number(e)
      );
      this.hasNotification = res.agent_assigned_ids.includes(
        Number(this._GuardService.getUser().id)
      );
      this.playNotificationSound();
    }
  }

  private playNotificationSound() {
    this.audioPlayer = new Audio();
    this.audioPlayer.src = '../../../assets/notification.mp3';
    this.audioPlayer.play();
  }

  closeNotify() {
    this.hasNotification = false;
  }

  answerLead(id:number){
    this._SurveyService.leadId.next(id);
    this._Router.navigate(['leads/answer']);
  }
}
