import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';

@Component({
  selector: 'app-create-analysis',
  templateUrl: './create-analysis.component.html',
  styleUrls: ['./create-analysis.component.scss'],
})
export class CreateAnalysisComponent implements OnInit {
  analysisForm!: FormGroup;
  private unsubscribe$ = new Subject<void>();
  creatingStatus: boolean = false;
  constructor(
    private _AnalysisService: AnalysisService,
    private _MessageService: MessageService
  ) {}

  ngOnInit(): void {
    this.createAnalysisForm();
    this.getFormAnalytics();
  }

  createAnalysisForm() {
    this.analysisForm = new FormGroup({
      mobile: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[\\d]{10}$'),
      ]),
      customer_name: new FormControl(null),
      customer_gender: new FormControl(null),
      emirate_id: new FormControl(null),
      platform: new FormControl(null, [Validators.required]),
      platform_option: new FormControl(null),
      customer_status: new FormControl(null, [Validators.required]),
      concern: new FormControl(null),
      mode: new FormControl(null),
      mode_reason: new FormControl(null),
      notes: new FormControl(null),
      ask_for: new FormControl(null),
      // ask_for_options: new FormArray([]),
      ask_for_options: new FormControl(null),
      actions: new FormControl(null),

      // actions: new FormArray([]),
      // reminder: new FormControl(null, [Validators.required]),
    });
    this.valueChanges();
  }

  analytics: any;
  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analytics = res.data;
    });
  }

  create(form: FormGroup) {
    if (form.valid) {
      this._AnalysisService.createAnalytics(form.value).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.creatingStatus = false;
            this.analysisForm.reset();
            this.createAnalysisForm();

            this._MessageService.add({
              severity: 'success',
              summary: 'Payment Created Successfully',
              detail: 'Payment link returned',
            });
          } else {
            this.creatingStatus = false;
            // this.paymentForm.patchValue({
            //   start_date: new Date(filteredData.start_date),
            //   birthday: new Date(filteredData.birthday),
            // });
          }
        },
        error: (err) => {
          this.creatingStatus = false;
          // this.paymentForm.patchValue({
          //   start_date: new Date(filteredData.start_date),
          //   birthday: new Date(filteredData.birthday),
          // });
        },
      });
    }
  }

  valueChanges() {
    this.analysisForm
      .get('platform')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handlePlatform(value);
        }
      });

    this.analysisForm
      .get('mode')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleMode(value);
        }
      });

      this.analysisForm
      .get('ask_for')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleAskFor(value);
        }
      });
  }

  platformOptions: [] = [];
  handlePlatform(value: string) {
    this.platformOptions = this.analytics.platforms.find(
      (item: any) => item.name === value
    ).options;
  }

  modeReasons: [] = [];
  handleMode(value: string) {
    this.modeReasons = this.analytics.mode.find(
      (item: any) => item.name === value
    ).reasons;
  }

  askReasons: [] = [];
  askActions: [] = [];
  handleAskFor(value: string) {
    this.askReasons = this.analytics[value].reasons;
    this.askActions = this.analytics[value].actions;
  }
}
