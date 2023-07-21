import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubscriptionsService } from 'src/app/services/subscriptions.service';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss'],
})
export class SubscriptionDetailsComponent implements OnInit {
  sub: any;
  columns: any[] = [];

  constructor(
    private _Router: Router,
    private _SubscriptionsService: SubscriptionsService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._SubscriptionsService.subscription
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['subscriptions/show']);
          } else {
            this.sub = res;
            this.columns = Object.keys(res).map((key) => ({
              label: this.capitalize(key.replace(/_/g, ' ')),
              key: key,
            }));
          }
        },
      });
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  backDetailsBtn() {
    this._Router.navigate(['subscriptions/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
