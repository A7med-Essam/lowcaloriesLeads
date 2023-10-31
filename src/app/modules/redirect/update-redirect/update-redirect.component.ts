import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RedirectService } from 'src/app/services/redirect.service';
@Component({
  selector: 'app-update-redirect',
  templateUrl: './update-redirect.component.html',
  styleUrls: ['./update-redirect.component.scss'],
})
export class UpdateRedirectComponent implements OnInit, OnDestroy {
  updateForm!: FormGroup;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private _Router: Router,
    private _RedirectService: RedirectService,
    private _MessageService: MessageService
  ) {}

  ngOnInit(): void {
    this.setUpdateForm();
    this.showDetails();
  }

  update() {
    this._RedirectService.updateUrl(this.updateForm.value).subscribe((res) => {
      this._MessageService.add({
        severity: 'success',
        summary: 'Notification',
        detail: res.message,
      });
      this._Router.navigate(['redirect/show']);
    });
  }

  showDetails() {
    this._RedirectService.redirect
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((url) => {
        if (url) {
          this.setUpdateForm(url);
        } else {
          this._Router.navigate(['redirect/show']);
        }
      });
  }

  setUpdateForm(data?: any) {
    this.updateForm = new FormGroup({
      url_id: new FormControl(data?.id, [Validators.required]),
      redirect_url: new FormControl(data?.redirect_url, [Validators.required]),
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
