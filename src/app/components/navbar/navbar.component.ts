import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { GuardService } from 'src/app/services/guard.service';
import { PusherService } from 'src/app/services/pusher.service';
import { UsersService } from 'src/app/services/users.service';

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
    // private _SurveyService: SurveyService,
    // private _DislikeService: DislikeService,
    // private _RefundService: RefundService,
    // private _AgentTargetService: AgentTargetService,
    // private _CallsService: CallsService,
    private _Router: Router,
    private _UsersService: UsersService
  ) {}

  notificationModal:boolean = false;
  customerModal:boolean = false;
  phoneModal:boolean = false;

  ngOnInit() {
    this._AuthService.currentUser.subscribe((data) => {
      if (data != null) {
        this.getNotifications();
      }else{
        this.isLogin = false;
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
  notifications: any[] = [];
  currentNotification:any;
  getNotifications() {
    if (this._GuardService.getUser()) {
      this.isLogin = true;
      this._PusherService.pusherEventLeadData.subscribe((res) => {
        if (res) {
          this.processNotification(res);
        }
      });
    } else {
      this.isLogin = false;
    }
  }

  private processNotification(res: any) {
    if (res) {
      res.agent_assigned_ids = res.agent_assigned_ids.map((e: string) =>
        Number(e)
      );
      this.hasNotification = res.agent_assigned_ids.includes(
        Number(this._GuardService.getUser().id)
      );
      if (this.hasNotification) {
        this.notificationModal = true;
        this.currentNotification = res;
        this.notifications = res?.notifications
        this.playNotificationSound();
      }
    }
  }

  private playNotificationSound() {
    this.audioPlayer = new Audio();
    this.audioPlayer.src = '../../../assets/notification.mp3';
    this.audioPlayer.play();
  }

  toggleNotifications() {
    this.hasNotification = !this.hasNotification;
    this.getAllNotifications();
  }

  getAllNotifications() {
    this._PusherService.notifications().subscribe({
      next: (res) => {
        this.notifications = res.data;
      },
    });
  }

  updateNotifications(notification: any) {
    this._PusherService.updateNotifications(notification.id).subscribe({
      next: (res) => {
        this.notifications = this.notifications.map((n) => {
          if (n.id === notification.id) {
            return res.data;
          }
          return notification;
        });
        this.redirect(notification);
      },
    });
  }

  redirect(notification: any) {
    switch (notification.type) {
      case 'lead':
        // this._SurveyService.leadId.next(notification.model_id);
        this._Router.navigate(['leads']);
        break;
      case 'call':
        // this._CallsService.call.next(notification.model_id);
        this._Router.navigate(['calls']);
        break;
      case 'target':
        // this._AgentTargetService.target.next(notification.model_id);
        this._Router.navigate(['target']);
        break;
      case 'refund':
        // this._RefundService.refund.next(notification.model_id);
        this._Router.navigate(['refund']);
        break;
        case 'dislike':
          // this._DislikeService.dislikeDetails.next(notification.model_id);
          this._Router.navigate(['leads']);
        break;
      default:
        return;
    }
  }

  // =================================================================================================
  customerModels:any;
  getCustomerModels(mobile: any){
    if (mobile != '') {
      this._UsersService.getCustomerModels(mobile.value).subscribe(res=>{
        if (res.status == 1) {
          this.phoneModal = false;
          this.customerModal = true;
          this.customerModels = res.data;
          mobile.value = null;
        }
      })
    }
  }
}
