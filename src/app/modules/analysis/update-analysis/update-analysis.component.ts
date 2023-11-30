import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';

@Component({
  selector: 'app-update-analysis',
  templateUrl: './update-analysis.component.html',
  styleUrls: ['./update-analysis.component.scss'],
})
export class UpdateAnalysisComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  analytics: any;
  analysisForm!: FormGroup;
  askReasons: [] = [];
  askActions: [] = [];
  platformOptions: [] = [];
  modeReasons: [] = [];
  minReminder: Date = new Date(new Date().setDate(new Date().getDate() + 1));
  maxReminder: Date = new Date(new Date().setDate(new Date().getDate() + 90));
  defaultReminder: Date = new Date(this.calculateDefaultReminder());
  creatingStatus: boolean = false;
  reminderModal: boolean = false;
  constructor(
    private _AnalysisService: AnalysisService,
    private _MessageService: MessageService,
    private _Router: Router
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.setAnalysisUpdateForm();
    this.getFormAnalytics();
  }

  setAnalysisUpdateForm() {
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
      ask_for_options: new FormControl(null),
      actions: new FormControl(null),
      reminder_date: new FormControl(null),
      dataRequest_id: new FormControl(null),
    });
    this.valueChanges();
  }

  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analytics = res.data;
      this.showDetails();
    });
  }

  update(form: FormGroup) {
    if (form.valid) {
      if (form.value.reminder_date) {
        this.analysisForm.patchValue({
          reminder_date: new Date(form.value.reminder_date)
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .split('.')[0],
        });
      }
      this._AnalysisService.updateAnalytics(form.value).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.creatingStatus = false;
            this.analysisForm.reset();
            this.setAnalysisUpdateForm();
            this._MessageService.add({
              severity: 'success',
              summary: 'Analytics',
              detail: 'Analytics Created Successfully',
            });
            this._Router.navigate(['analysis/show']);
          } else {
            this.creatingStatus = false;
            if (form.value.reminder_date != null) {
              this.analysisForm.patchValue({
                reminder_date: new Date(form.value.reminder_date),
              });
            }
          }
        },
        error: (err) => {
          this.creatingStatus = false;
          if (form.value.reminder_date != null) {
            this.analysisForm.patchValue({
              reminder_date: new Date(form.value.reminder_date),
            });
          }
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
      .get('customer_status')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        if (value) {
          this.handleCustomerStatus();
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

  handlePlatform(value: string) {
    this.platformOptions = this.analytics.platforms.find(
      (item: any) => item.name === value
    ).options;

    if (this.platformOptions.length == 0) {
      this.analysisForm.patchValue({
        platform_option: null,
      });
    }
  }

  handleCustomerStatus() {
    this.analysisForm.patchValue({
      ask_for: null,
    });
  }

  handleMode(value: string) {
    this.modeReasons = this.analytics.mode.find(
      (item: any) => item.name === value
    ).reasons;
    if (this.modeReasons.length == 0) {
      this.analysisForm.patchValue({
        mode_reason: null,
      });
    }
  }

  handleAskFor(value: string) {
    this.askReasons = this.analytics[value].reasons;
    this.askActions = this.analytics[value].actions;

    this.analysisForm.patchValue({
      ask_for_options: null,
      actions: null,
    });
  }

  // ================================== REMINDER ==================================

  private calculateDefaultReminder(): Date {
    if (this.currentRow?.reminder_date) {
      return new Date(this.currentRow.reminder_date);
    } else {
      const currentDate = new Date();
      const twoDaysLater = new Date(
        currentDate.setDate(currentDate.getDate() + 2)
      );
      return twoDaysLater;
    }
  }

  setDefaultReminder() {
    this.analysisForm.get('reminder_date')?.setValue(this.defaultReminder);
    this.reminderModal = false;
    this._MessageService.add({
      severity: 'success',
      summary: 'Reminder',
      detail: 'Reminder has been add successfully',
    });
  }

  // ================================== Patch Values ==================================
  currentRow: any;
  showDetails() {
    this._AnalysisService.analysis
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((analysis) => {
        if (analysis) {
          this.currentRow = analysis;
          this.patchValues(analysis);
        } else {
          this._Router.navigate(['analysis/show']);
        }
      });
  }

  patchValues(value: any) {
    this.analysisForm.patchValue({
      mobile: value.mobile,
      customer_name: value.customer_name,
      customer_gender: value.customer_gender,
      emirate_id: value.emirate.id,
      platform: value.platform,
      platform_option: value.platform_option,
      customer_status: value.customer_status,
      concern: value.concern,
      mode: value.mode,
      mode_reason: value.mode_reason,
      notes: value.notes,
      ask_for: value.ask_for,
      ask_for_options: value.ask_for_options,
      actions: value.actions,
      reminder_date: value.reminder_date ? new Date(value.reminder_date) : null,
      dataRequest_id: value.id,
    });
    this.defaultReminder = new Date(this.calculateDefaultReminder());
  }
}
