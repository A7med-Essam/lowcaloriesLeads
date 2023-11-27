import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  constructor(private _ApiConfigService: ApiConfigService) {}
  filter: BehaviorSubject<any> = new BehaviorSubject(null);

  getAnalytics(page: number):Observable<any>{
    return this._ApiConfigService.postReq3(`dataAnalyticRequests?page=${page}`, '');
  }

  filterAnalytics(page: number,filter:any){
    return this._ApiConfigService.postReq3(`dataAnalyticRequests?page=${page}`, filter);
  }

  getFormAnalytics():Observable<any>{
    return this._ApiConfigService.postReq3(`dataAnalytics`, '');
  }

  createAnalytics(data:any):Observable<any>{
    return this._ApiConfigService.postReq3(`addDataRequest`, data);
  }

  exportAll(): Observable<any> {
    return this._ApiConfigService.postReq3(`exportDataAnalyticRequest`,'');
  }

  exportByIds(dataRequestIds:number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`exportDataAnalyticRequestByIds`, {dataRequestIds});
  }
}
