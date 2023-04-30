import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'lowcaloriesLeads';

  constructor(private _AppService: AppService) {}
  getClasses() {
    const classes = {
      'pinned-sidebar': this._AppService.getSidebarStat().isSidebarPinned,
      'toggeled-sidebar': this._AppService.getSidebarStat().isSidebarToggeled
    }
    return classes;
  }
  toggleSidebar() {
    this._AppService.toggleSidebar();
  }
}
