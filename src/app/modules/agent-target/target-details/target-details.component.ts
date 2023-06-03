import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentTargetService } from 'src/app/services/agent-target.service';

@Component({
  selector: 'app-target-details',
  templateUrl: './target-details.component.html',
  styleUrls: ['./target-details.component.scss']
})
export class TargetDetailsComponent implements OnInit {
  target: any;

  constructor(
    private _Router: Router,
    private _AgentTargetService: AgentTargetService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._AgentTargetService.target
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['agent/show']);
          } else {
            this.target = res
          }
        },
      });
  }

  backDetailsBtn() {
    this._Router.navigate(['agent/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
