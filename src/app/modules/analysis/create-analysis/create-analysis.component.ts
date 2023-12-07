import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalysisService } from 'src/app/services/analysis.service';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-create-analysis',
  templateUrl: './create-analysis.component.html',
  styleUrls: ['./create-analysis.component.scss'],
})
export class CreateAnalysisComponent implements OnInit, OnDestroy {
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
  isLoading: boolean = false;
  constructor(
    private _AnalysisService: AnalysisService,
    private _MessageService: MessageService,
    private _LocalService: LocalService
  ) {}

  current_user: any;
  ngOnInit(): void {
    this.createAnalysisForm();
    this.getFormAnalytics();
    this.current_user = this._LocalService.getJsonValue(
      'userInfo_oldLowCalories'
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
      ask_for_options: new FormControl(null),
      actions: new FormControl(null),
      reminder_date: new FormControl(null),
    });
    this.valueChanges();
  }

  getFormAnalytics() {
    this.isLoading = true;
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analytics = res.data;
      this.isLoading = false;
    });
  }

  create(form: FormGroup) {
    if (form.valid) {
      this.isLoading = true;
      if (form.value.reminder_date) {
        this.analysisForm.patchValue({
          // reminder_date: new Date(form.value.reminder_date).toLocaleDateString('en-CA'),
          reminder_date: new Date(form.value.reminder_date)
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .split('.')[0],
        });
      }
      if (form.value.notes) {
        this.analysisForm.patchValue({
          notes: `${this.current_user.name} => ${form.value.notes}`,
        });
      }
      this._AnalysisService.createAnalytics(form.value).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.creatingStatus = false;
            this.isLoading = false;
            this.analysisForm.reset();
            this.createAnalysisForm();
            this._MessageService.add({
              severity: 'success',
              summary: 'Analytics',
              detail: 'Analytics Created Successfully',
            });
          } else {
            this.creatingStatus = false;
            this.isLoading = false;

            if (form.value.reminder_date != null) {
              this.analysisForm.patchValue({
                reminder_date: new Date(form.value.reminder_date),
              });
            }
          }
        },
        error: (err) => {
          this.creatingStatus = false;
          this.isLoading = false;

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
  }

  handleMode(value: string) {
    this.modeReasons = this.analytics.mode.find(
      (item: any) => item.name === value
    ).reasons;
  }

  handleAskFor(value: string) {
    this.askReasons = this.analytics[value].reasons;
    this.askActions = this.analytics[value].actions;
  }

  // ================================== REMINDER ==================================

  private calculateDefaultReminder(): Date {
    const currentDate = new Date();
    const twoDaysLater = new Date(
      currentDate.setDate(currentDate.getDate() + 2)
    );
    return twoDaysLater;
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
}
