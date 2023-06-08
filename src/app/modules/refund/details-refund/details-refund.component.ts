import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-details-refund',
  templateUrl: './details-refund.component.html',
  styleUrls: ['./details-refund.component.scss']
})
export class DetailsRefundComponent implements OnInit {
  refund: any;

  constructor(
    private _Router: Router,
    private _RefundService: RefundService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._RefundService.refund
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['refund/show']);
          } else {
            this.refund = res
          }
        },
      });
  }

  backDetailsBtn() {
    this._Router.navigate(['refund/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
