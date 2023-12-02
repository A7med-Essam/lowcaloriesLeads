import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  constructor(private _ApiConfigService: ApiConfigService) {}
  filter: BehaviorSubject<any> = new BehaviorSubject(null);
  analysis: BehaviorSubject<any> = new BehaviorSubject(null);

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

  exportByIds(dataRequestIds: number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`exportDataAnalyticRequestByIds`, {
      dataRequestIds,
    });
  }

  getSample(): Observable<any> {
    return this._ApiConfigService.postReq3(`analyticsSample`, '');
  }

  uploadFile(file: File): Observable<any> {
    return this._ApiConfigService.postReq3(`analyticsImport`, file);
  }

  // =================================================================================================

  allReminder(): Observable<any> {
    return this._ApiConfigService.postReq3(`allReminderDataRequests`, {
      withoutPagination: true,
    });
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

  // =================================================================================================

  
  getDataAnalyticOption(): Observable<any> {
    return this._ApiConfigService.postReq3(`getDataAnalyticOption`, '');
  }
  
  addNewDataAnalyticOption(data:any): Observable<any> {
    return this._ApiConfigService.postReq3(`addNewDataAnalyticOption`, data);
  }
  
  deleteDataAnalyticOption(data_analytic_option_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteDataAnalyticOption`, {data_analytic_option_id});
  }

  showDataAnalyticOption(data_analytic_option_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`showDataAnalyticOption`, {data_analytic_option_id});
  }

  suggestDataOptions(): Observable<any> {
    return this._ApiConfigService.postReq3(`suggestDataOptions`, '');
  }
}
