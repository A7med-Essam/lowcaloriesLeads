import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Calendar } from 'primeng/calendar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { SurveyService } from 'src/app/services/survey.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-lead-details',
  templateUrl: './lead-details.component.html',
  styleUrls: ['./lead-details.component.scss'],
})
export class LeadDetailsComponent implements OnInit, OnDestroy {
  // isSuperAdmin: boolean = false;
  lead: any;
  constructor(private _SurveyService: SurveyService, private _Router: Router) {}
  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._SurveyService.lead.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res) => {
        if (res == 0) {
          this._Router.navigate(['leads/show']);
        } else {
          this.lead = res;
        }
      },
    });
  }

  backDetailsBtn() {
    this._Router.navigate(['leads/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
