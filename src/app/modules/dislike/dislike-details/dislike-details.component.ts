import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DislikeService } from 'src/app/services/dislike.service';

@Component({
  selector: 'app-dislike-details',
  templateUrl: './dislike-details.component.html',
  styleUrls: ['./dislike-details.component.scss'],
})
export class DislikeDetailsComponent implements OnInit {
  dislike: any;

  constructor(
    private _Router: Router,
    private _DislikeService: DislikeService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._DislikeService.dislikeDetails
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['dislike/show']);
          } else {
            // this.getLeadDetails(res);
            console.log(res);
            this.dislike = res
          }
        },
      });
  }

  // getLeadDetails(id: number) {
  //   this._DislikeService.getDislikesDetails(id).subscribe({
  //     next: (res) => {
  //       this.dislike = res.data;
  //     },
  //   });
  // }

  backDetailsBtn() {
    this._Router.navigate(['dislike/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
