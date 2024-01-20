import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { GuardService } from 'src/app/services/guard.service';

@Component({
  selector: 'app-complaints-details',
  templateUrl: './complaints-details.component.html',
  styleUrls: ['./complaints-details.component.scss']
})
export class ComplaintsDetailsComponent implements OnInit, OnDestroy {
  complaint: any;
  isSuperAdmin: boolean = false;

  constructor(
    private _Router: Router,
    private _ComplaintsService: ComplaintsService,
    private _GuardService:GuardService
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
            this.getFiles(res.id)

            this.isSuperAdmin = 
            this._GuardService.isSuperAdmin();
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

  files:any[]=[]
  getFiles(id:number){
    this._ComplaintsService.getFiles(id).subscribe(res=>{
      this.files = res.data.issue_files
    })
  }
}
