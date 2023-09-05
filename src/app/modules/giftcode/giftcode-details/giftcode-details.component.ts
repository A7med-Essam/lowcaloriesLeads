import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GiftcodeService } from 'src/app/services/giftcode.service';

@Component({
  selector: 'app-giftcode-details',
  templateUrl: './giftcode-details.component.html',
  styleUrls: ['./giftcode-details.component.scss']
})
export class GiftcodeDetailsComponent implements OnInit, OnDestroy {
  giftcode: any;

  constructor(
    private _Router: Router,
    private _GiftcodeService: GiftcodeService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._GiftcodeService.giftcode
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['giftcode/show']);
          } else {
            this.giftcode = res
          }
        },
      });
  }

  backDetailsBtn() {
    this._Router.navigate(['giftcode/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
