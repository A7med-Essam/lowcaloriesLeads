import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GuardService } from 'src/app/services/guard.service';
import { Subject } from 'rxjs';
import { RedirectService } from 'src/app/services/redirect.service';

@Component({
  selector: 'app-show-redirect',
  templateUrl: './show-redirect.component.html',
  styleUrls: ['./show-redirect.component.scss'],
})
export class ShowRedirectComponent implements OnInit {
  constructor(
    private _Router: Router,
    private _RedirectService: RedirectService,
    private _GuardService: GuardService
  ) {}

  createPermission: boolean = false;
  updatePermission: boolean = false;

  getPermission() {
    this.createPermission =
      this._GuardService.getPermissionStatus('create_redirect');
    this.updatePermission =
      this._GuardService.getPermissionStatus('update_redirect');
  }

  redirects: any[] = [];

  ngOnInit(): void {
    this.getPermission();
    this.getRedirects();
  }

  getRedirects() {
    this._RedirectService.getRedirects().subscribe({
      next: (res) => {
        this.redirects = res.data;
      },
    });
  }

  updateRow(url: any) {
    if (url) {
      this._RedirectService.redirect.next(url);
      this._Router.navigate(['redirect/update']);
    }
  }
}
