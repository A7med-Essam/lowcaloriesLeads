import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class SendBulkWhatsappService {
  modelReport_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private _ApiConfigService: ApiConfigService) {}

  sendBulkMessage(body: any): Observable<{
    data: number;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`sendBulkWhatappMsg`, body);
  }

  getBulkWhatsappNumbers(body: any): Observable<{
    data: string[];
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`getBulkWhatsappNumbers`, body);
  }
  sqlQueryServices(body: any): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`sqlQueryServices`, body);
  }

  getWhatsAppSenderMessages(): Observable<{
    data: IWhatsAppSenderMessages[];
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`getWhatsAppSenderMessages`, '');
  }

  updateWhatsAppSenderMessages(row: IUpdateWhatsAppMessages): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`updateWhatsAppSenderMessages`, row);
  }

  deleteWhatsAppSenderMessages(message_id: number): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`deleteWhatsAppSenderMessages`, {
      message_id,
    });
  }

  createWhatsAppSenderMessages(row: any): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`addWhatsAppSenderMessages`, row);
  }

  addQueryRequest(row: any): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`addQueryRequest`, row);
  }

  addQueryService(row: any): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`addQueryServices`, row);
  }

  deleteQuery(query_id: number): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`deleteQueryRequest`, { query_id });
  }
  deleteQueryServices(query_id: number): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`deleteQueryServices`, { query_id });
  }

  getQueryRequest(
    page: number = 0,
    rows: number = 0
  ): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(
      `getQueryRequest${page == 0 ? '' : '?page=' + page}`,
      rows == 0
        ? {
            withoutPagination: true,
          }
        : {
            paginate: rows,
          }
    );
  }

  exportSchedualNumbers(schedual_id: number, status = 'all') {
    this.exportScheduleJobNumbers(schedual_id, status).subscribe((res) => {
      const link = document.createElement('a');
      link.target = '_blank';
      link.href = res.data;
      link.click();
    });
  }

  getScheduleJobs(
    page: number = 0,
    rows: number = 0
  ): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(
      `getScheduleJobs${page == 0 ? '' : '?page=' + page}`,
      rows == 0
        ? {
            withoutPagination: true,
          }
        : {
            paginate: rows,
          }
    );
  }
  exportScheduleJobNumbers(
    schedule_job_id: number,
    status: string
  ): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`exportSchedualNumbers`, {
      schedule_job_id,
      status,
    });
  }
  deleteSchedualNumbers(schedule_job_id: number): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`deleteScheduleNumbers`, {
      schedule_job_id,
    });
  }
  resendWhatsappBulk(schedule_job_id: number): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`resendBulkWhatsapp`, {
      schedule_job_id,
    });
  }

  pauseScheduleJob(schedule_job_id: number): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`pauseScheduleJob`, {
      schedule_job_id,
    });
  }

  returnPlayScheduleJob(schedule_job_id: number): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`returnPlayScheduleJob`, {
      schedule_job_id,
    });
  }
  getScheduleNumbers(
    schedule_job_id: number,
    page: number = 0,
    rows: number = 0
  ): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(
      `getScheduleJobRecords${page == 0 ? '' : '?page=' + page}`,
      rows == 0
        ? {
            withoutPagination: true,
            schedule_job_id,
          }
        : {
            paginate: rows,
            schedule_job_id,
          }
    );
  }

  getQueryService(
    page: number = 0,
    rows: number = 0
  ): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(
      `getQueryServices${page == 0 ? '' : '?page=' + page}`,
      rows == 0
        ? {
            withoutPagination: true,
          }
        : {
            paginate: rows,
          }
    );
  }

  // =====================================================================

  getSenders(): Observable<{ data: any; message: string; status: number }> {
    return this._ApiConfigService.postReq3(`getSenders`, '');
  }
  addSenders(
    row: any
  ): Observable<{ data: any; message: string; status: number }> {
    return this._ApiConfigService.postReq3(`addSenders`, row);
  }
  updateSenders(
    row: any
  ): Observable<{ data: any; message: string; status: number }> {
    return this._ApiConfigService.postReq3(`updateSenders`, row);
  }
  deleteSenders(
    sender_id: number
  ): Observable<{ data: any; message: string; status: number }> {
    return this._ApiConfigService.postReq3(`deleteSenders`, { sender_id });
  }

  checkWhatsAppServices(): Observable<{
    data: boolean;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`checkWhatsAppServices`, '');
  }
  stopWhatsAppBulkServices(): Observable<{
    data: boolean;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`stopWhatsAppBulkServices`, '');
  }

  getAllCrons(): Observable<{
    data: any[];
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`getAllCrons`, { withoutPagination: true});
  }
  updateCron(request: any): Observable<{
    data: any;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`updateCron`, request);
  }
}

export interface IWhatsAppSenderMessages {
  id: string;
  case: string;
  message: string;
  created_at: Date;
  updated_at: null;
}

export interface IUpdateWhatsAppMessages {
  message_id: string;
  case: string;
  message: string;
}
