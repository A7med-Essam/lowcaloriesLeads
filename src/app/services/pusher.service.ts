import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';
import { LocalService } from './local.service';
@Injectable({
  providedIn: 'root',
})
export class PusherService {
  pusher: any;
  userId: number = 0;
  constructor(
    private _ApiConfigService: ApiConfigService,
    private _LocalService: LocalService
  ) {}

  firePusher(userLogout: boolean = false) {
    this.userId =
      this._LocalService.getJsonValue('userInfo_oldLowCalories')?.id || 0;

    if (this.userId) {
      this.pusher = new Pusher('2453154bb7ba5edf59c3', {
        cluster: 'eu',
      });
      if (userLogout) {
        this.agentUpdateStatus('Offline').subscribe();
      } else {
        this.pusher.connection.bind('state_change', (states: any) => {
          const currentConnectionState = states.current;
          if (currentConnectionState === 'connected') {
            this.agentUpdateStatus('Online').subscribe();
          } else if (currentConnectionState === 'unavailable') {
            this.agentUpdateStatus('Offline').subscribe();
          }
        });
        this.handlePusherDisconnection();
      }
    }
  }

  handlePusherDisconnection() {
    this.pusher.connection.bind('disconnected', () => {
      this.agentUpdateStatus('Offline').subscribe();
    });
    window.addEventListener('beforeunload', (event) => {
      event.returnValue = 'Are you sure you want to leave this page?';
      this.agentUpdateStatus('Offline').subscribe();
      if (event.cancelable) {
        setTimeout(() => {
          this.agentUpdateStatus('Online').subscribe();
        }, 1);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // this.agentUpdateStatus('Offline').subscribe();
      }
    });
  }

  agentUpdateStatus(status: string): Observable<any> {
    const data = {
      agent_id: this.userId,
      status: status,
    };
    return this._ApiConfigService.postReq3(`agentUpdateStatus`, data);
  }
}
