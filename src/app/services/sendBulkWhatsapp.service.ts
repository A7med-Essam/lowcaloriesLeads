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
    data: string[];
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
