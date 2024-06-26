import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
            this.getFiles(res.id)
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

  files:any[]=[]
  getFiles(id:number){
    this._RefundService.getFiles(id).subscribe(res=>{
      this.files = res.data.refund_files
    })
  }
}
