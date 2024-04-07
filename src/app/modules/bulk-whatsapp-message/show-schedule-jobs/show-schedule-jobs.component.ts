import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SendBulkWhatsappService } from 'src/app/services/sendBulkWhatsapp.service';

@Component({
  selector: 'app-show-schedule-jobs',
  templateUrl: './show-schedule-jobs.component.html',
  styleUrls: ['./show-schedule-jobs.component.scss'],
})
export class ShowScheduleJobsComponent implements OnInit {
  constructor(
    private _FormBuilder: FormBuilder,
    private _SendBulkWhatsappService: SendBulkWhatsappService,
    private _MessageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getScheduleJobs();
  }
  scheduleJobs: any[] = [];
  page = 1;
  pagination: any = {
    first: 1,
    rows: 50,
  };
  total!: number;

  getScheduleJobs() {
    this._SendBulkWhatsappService
      .getScheduleJobs(this.page, this.pagination.rows)
      .subscribe((res) => {
        this.scheduleJobs = res.data.data;
        this.total = res.data.total;
        this.pagination.rows = res.data.per_page;
      });
  }

  onPageChange(event: any) {
    console.log(event);
    this.page = event.page + 1;
    this.pagination.rows = event.rows;
    this.getScheduleJobs();
  }
  public get SchedualJobStatus(): typeof SchedualJobStatus {
    return SchedualJobStatus;
  }
  exportSchedualNumbers(schedual_id: number, status = SchedualJobStatus.all) {
    this._SendBulkWhatsappService.exportSchedualNumbers(schedual_id, status);
  }
  returnPlayScheduleJob(schedual_id: number) {
    this._SendBulkWhatsappService
      .returnPlayScheduleJob(schedual_id)
      .subscribe((res) => {
        this.getScheduleJobs();
        this._MessageService.add({
          severity: 'success',
          summary: 'Schedual Job',
          detail: res.message,
        });
      });
  }
  pauseScheduleJob(schedual_id: number) {
    this._SendBulkWhatsappService
      .pauseScheduleJob(schedual_id)
      .subscribe((res) => {
        this.getScheduleJobs();
        this._MessageService.add({
          severity: 'success',
          summary: 'Schedual Job',
          detail: res.message,
        });
      });
  }
  deleteSchedualNumbers(schedual_id: number) {
    this._SendBulkWhatsappService
      .deleteSchedualNumbers(schedual_id)
      .subscribe((res) => {
        this.getScheduleJobs();
        this._MessageService.add({
          severity: 'success',
          summary: 'Schedual Job',
          detail: res.message,
        });
      });
  }
  confirm(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteSchedualNumbers(id);
      },
    });
  }
}

enum SchedualJobStatus {
  all = 'all',
  complete = 'complete',
  failed = 'failed',
}
