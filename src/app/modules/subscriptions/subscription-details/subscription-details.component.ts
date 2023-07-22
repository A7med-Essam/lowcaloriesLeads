import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubscriptionDetails, SubscriptionsService } from 'src/app/services/subscriptions.service';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss'],
})
export class SubscriptionDetailsComponent implements OnInit {
  sub!: SubscriptionDetails;
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
            this.getSubscriptionDetails(res.id)
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

  getSubscriptionDetails(id:number){
    this._SubscriptionsService.getSubscriptionDetails(id).subscribe({
      next:res=>{
        if (res.status) {
          this.sub = res.data
          this.columns = Object.keys(res.data).map((key) => ({
            label: this.capitalize(key.replace(/_/g, ' ')),
            key: key,
          }));
        }
        else{
          this._Router.navigate(['subscriptions/show']);
        }
      },
      error:err=>{
        this._Router.navigate(['subscriptions/show']);
      }
    })
  }
}
