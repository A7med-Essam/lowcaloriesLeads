import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { Checkbox } from 'primeng/checkbox';
import { GuardService } from 'src/app/services/guard.service';
import { MessageService } from 'primeng/api';
import { TableCheckbox } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RedirectService } from 'src/app/services/redirect.service';

@Component({
  selector: 'app-show-redirect',
  templateUrl: './show-redirect.component.html',
  styleUrls: ['./show-redirect.component.scss'],
})
export class ShowRedirectComponent implements OnInit, OnDestroy {
  constructor(
    private _Router: Router,
    private _RedirectService: RedirectService,
    private _GuardService: GuardService,
  ) {}
  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

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
    this.getComplaints();
  }

  getComplaints() {
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
