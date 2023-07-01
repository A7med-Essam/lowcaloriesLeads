import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CallsService } from 'src/app/services/calls.service';

@Component({
  selector: 'app-call-details',
  templateUrl: './call-details.component.html',
  styleUrls: ['./call-details.component.scss']
})
export class CallDetailsComponent implements OnInit {

  call: any;

  constructor(
    private _Router: Router,
    private _CallsService: CallsService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._CallsService.call
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['calls/assign']);
          } else {
            this.call = res
            this.getCallFiles(res.id);
          }
        },
      });
  }

  backDetailsBtn() {
    this._Router.navigate(['calls/assign']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  files:any[]=[]
  getCallFiles(id:number){
    this._CallsService.getFiles(id).subscribe(res=>{
      this.files = res.data.call_files
    })
  }

}
