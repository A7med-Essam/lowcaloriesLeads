import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SendBulkWhatsappService } from 'src/app/services/sendBulkWhatsapp.service';

@Component({
  selector: 'app-records-schedule-jobs',
  templateUrl: './records-schedule-jobs.component.html',
  styleUrls: ['./records-schedule-jobs.component.scss'],
})
export class RecordsScheduleJobsComponent implements OnInit {
  schedualId!: any;
  constructor(
    private route: ActivatedRoute,
    private _SendBulkWhatsappService: SendBulkWhatsappService
  ) {
    this.schedualId = route.snapshot.paramMap.get('id');
  }
  scheduleNumbers: any[] = [];
  page = 1;
  pagination: any = {
    first: 1,
    rows: 15,
  };
  total!: number;

  ngOnInit(): void {
    this.getScheduleNumbers(this.schedualId);
  }
  getScheduleNumbers(schedual_id: number) {
    this._SendBulkWhatsappService
      .getScheduleNumbers(Number(schedual_id), this.page, this.pagination.rows)
      .subscribe((res) => {
        this.scheduleNumbers = res.data.data;
        this.total = res.data.total;
        this.pagination.rows = res.data.per_page;
      });
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pagination.rows = event.rows;
    this.getScheduleNumbers(this.schedualId);
  }
  public get SchedualJobStatus(): typeof SchedualJobStatus {
    return SchedualJobStatus;
  }

  exportSchedualNumbers(schedual_id: number, status: SchedualJobStatus) {
    this._SendBulkWhatsappService.exportSchedualNumbers(schedual_id, status);
  }
}

enum SchedualJobStatus {
  all = 'all',
  complete = 'complete',
  failed = 'failed',
}
