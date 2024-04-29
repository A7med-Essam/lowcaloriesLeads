import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { PusherService } from './services/pusher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'lowcaloriesLeads';
  pusher: any;
  userId: number = 0;
  constructor(
    private _AppService: AppService,
    private _PusherService:PusherService
  ) { 
    // _PusherService.firePusher();
   }

  getClasses() {
    const classes = {
      'pinned-sidebar': this._AppService.getSidebarStat().isSidebarPinned,
      'toggeled-sidebar': this._AppService.getSidebarStat().isSidebarToggeled,
    };
    return classes;
  }

  toggleSidebar() {
    this._AppService.toggleSidebar();
  }

}
