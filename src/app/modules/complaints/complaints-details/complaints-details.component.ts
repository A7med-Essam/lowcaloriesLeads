import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { ComplaintsService } from 'src/app/services/complaints.service';

@Component({
  selector: 'app-complaints-details',
  templateUrl: './complaints-details.component.html',
  styleUrls: ['./complaints-details.component.scss']
})
export class ComplaintsDetailsComponent implements OnInit {
  complaint: any;

  constructor(
    private _Router: Router,
    private _ComplaintsService: ComplaintsService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._ComplaintsService.complaint
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['complaints/show']);
          } else {
            this.complaint = res
          }
        },
      });
  }

  backDetailsBtn() {
    this._Router.navigate(['complaints/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
