import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  constructor(private _ApiConfigService: ApiConfigService) {}
  filterv1: BehaviorSubject<any> = new BehaviorSubject(null);
  filter: BehaviorSubject<any> = new BehaviorSubject(null);
  analysis: BehaviorSubject<any> = new BehaviorSubject(null);
  filtered_Reminder: BehaviorSubject<any> = new BehaviorSubject(null);
  analysisV2: BehaviorSubject<any> = new BehaviorSubject(null);

  getAnalytics(page: number): Observable<any> {
    return this._ApiConfigService.postReq3(
      `dataAnalyticRequests?page=${page}`,
      ''
    );
  }

  filterAnalytics(page: number, filter: any) {
    return this._ApiConfigService.postReq3(
      `dataAnalyticRequests?page=${page}`,
      filter
    );
  }

  filterAnalyticsWithoutPagination(page: number, filter: any) {
    filter.withoutPagination = true;
    return this._ApiConfigService.postReq3(
      `dataAnalyticRequests`,
      filter
    );
  }

  filterAnalyticsWithoutPaginationV2(page: number, filter: any) {
    filter.withoutPagination = true;
    filter.version = 'v2';
    return this._ApiConfigService.postReq3(
      `dataAnalyticRequests`,
      filter
    );
  }

  getFormAnalytics(): Observable<any> {
    return this._ApiConfigService.postReq3(`dataAnalytics`, '');
  }

  createAnalytics(data: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addDataRequest`, data);
  }

  updateAnalytics(dataRequest_id: any): Observable<any> {
    return this._ApiConfigService.postReq3(`updateDataRequest`, dataRequest_id);
  }

  deleteAnalytics(dataRequest_id: any): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteDataRequest`, {
      dataRequest_id,
    });
  }

  exportAll(): Observable<any> {
    return this._ApiConfigService.postReq3(`exportDataAnalyticRequest`, '');
  }

  exportAllV2(): Observable<any> {
    return this._ApiConfigService.postReq3(`exportDataAnalyticRequest`, { version: 'v2' });
  }

  exportByIds(dataRequestIds: number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`exportDataAnalyticRequestByIds`, {
      dataRequestIds,
    });
  }

  getSample(): Observable<any> {
    return this._ApiConfigService.postReq3(`analyticsSample`, '');
  }

  // uploadFile(file: File): Observable<any> {
  //   return this._ApiConfigService.postReq3(`analyticsImport`, file);
  // }

  // ===========================================REMINDER======================================================

  allReminder(): Observable<any> {
    return this._ApiConfigService.postReq3(`allReminderDataRequests`, {
      withoutPagination: true,
    });
  }

  filterReminder(filter: any) {
    filter.withoutPagination = true;
    return this._ApiConfigService.postReq3(
      `allReminderDataRequests`,
      filter
    );
  }

  updateReminder(remindDataRequest_id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`addReminderDataRequests`, {
      remindDataRequest_id,
    });
  }

  getAnalyticsById(dataRequest_id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`showDataRequests`, {
      dataRequest_id,
    });
  }

  // =============================================MANAGER====================================================

  getDataAnalyticOption(): Observable<any> {
    return this._ApiConfigService.postReq3(`getDataAnalyticOption`, '');
  }

  addNewDataAnalyticOption(data: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addNewDataAnalyticOption`, data);
  }

  deleteDataAnalyticOption(id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteDataAnalyticOption`, {
      data_analytic_option_ids:[id],
    });
  }

  showDataAnalyticOption(data_analytic_option_id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`showDataAnalyticOption`, {
      data_analytic_option_id,
    });
  }

  suggestDataOptions(): Observable<any> {
    return this._ApiConfigService.postReq3(`suggestDataOptions`, '');
  }

  addLabelForDataOption(data: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addLabelForDataOption`, data);
  }

  updateAnalyticName(data: any): Observable<any> {
    return this._ApiConfigService.postReq3(`updateDataAnalyticOption`, data);
  }

  getAnalyticsChildrenById(data_analytic_option_id: number): Observable<any> {
    return this._ApiConfigService.postReq3(`showDataAnalyticOption`, {
      data_analytic_option_id,
    });
  }

  getLabels(): Observable<any> {
    return this._ApiConfigService.postReq3(`getAllLabelDataAnalyticOption`, '');
  }


  // ================================================V2=================================================

  createAnalytics2(data: any): Observable<any> {
    return this._ApiConfigService.postReq3(`addDataRequestV2`, data);
  }

  checkPhoneNumberExist(phone_number: any): Observable<any> {
    return this._ApiConfigService.postReq33(`checkPhoneNumberExist`, {phone_number});
  }

  updateAnalytics2(data: any): Observable<any> {
    return this._ApiConfigService.postReq3(`updateDataRequestV2`, data);
  }

  getAnalytics2(page: number): Observable<any> {
    return this._ApiConfigService.postReq3(
      `dataAnalyticRequests?page=${page}`,
      // { version: 'v2' }
      ''
    );
  }

  filterAnalyticsV2(page: number, filter: any) {
    filter.version = 'v2';
    return this._ApiConfigService.postReq3(
      `dataAnalyticRequests?page=${page}`,
      filter
    );
  }

  filterAnalyticsByMobile(filter: any) {
    filter.version = 'v2';
    filter.withoutPagination = true;
    return this._ApiConfigService.postReq3(
      `dataAnalyticRequests`,
      filter
    );
  }

  getAllAnalyticOptions(): Observable<any> {
    return this._ApiConfigService.postReq3(`getAllParentDataAnalyticOption`, '');
  }

  deleteBulkData(rows:any){
    return this._ApiConfigService.postReq3(`deleteDataAnalyticOption`, rows);
  }

  uploadFiles(files:any): Observable<any> {
    return this._ApiConfigService.postReq3(`uploadDataAnalyticFiles` , files);
  }
}
