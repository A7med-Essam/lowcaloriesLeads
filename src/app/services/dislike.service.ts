import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DislikeService {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }
  dislikeDetails: BehaviorSubject<any> = new BehaviorSubject(null);

  getCustomerInfo(CID: number): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/SqlQuery?Qry=SELECT * FROM [KOTDB].[dbo].[Customers] WHERE [CustomerId] =${CID}`);
  }

  getMeals(): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/SqlQuery?Qry=SELECT * FROM [KOTDB].[dbo].[MealsDetail]`);
  }

  storeDislikeRequest(data:any): Observable<any> {
    return this._ApiConfigService.postReq3(`storeDislikeRequest`,data);
  }

  getAgentBranches(): Observable<any> {
    return this._ApiConfigService.postReq3(`getAgentBranches`,'');
  }

  getDislikes(page:number):Observable<any> {
    return this._ApiConfigService.postReq3(`allDislikeRequests?page=${page}`,'')
  }
 
  getAllDislikes():Observable<any> {
    return this._ApiConfigService.postReq3(`allDislikeRequests`, {withoutPagination:true});
  }

  updateDislikes(dislike:any):Observable<any> {
    return this._ApiConfigService.postReq3('updateDislikeRequest',dislike)
  }

  getDislikesDetails(dislike_request_id:number):Observable<any> {
    return this._ApiConfigService.postReq3('showDislikeRequest',{dislike_request_id})
  }

  filterDislikes(filter: any): Observable<any> {
    filter.withoutPagination = true;
    return this._ApiConfigService.postReq3(`allDislikeRequests`, filter);
  }

  // =========================== reasons ===========================

  getReasons(): Observable<any> {
    return this._ApiConfigService.postReq3(`reasons`,'');
  }

  addReasons(reason:string): Observable<any> {
    return this._ApiConfigService.postReq3(`addReasons`,{reason});
  }

  deleteReasons(reason_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`deleteReasons`,{reason_id});
  }

  exportAll(): Observable<any>{
    return this._ApiConfigService.postReq3(`disLikeExport`,'');
  }
  
  // TODO: check dislikeIds
  exportByIds(dislikeIds:number[]): Observable<any>{
    return this._ApiConfigService.postReq3(`dislikeExportByIds`,dislikeIds);
  }

  getSample(): Observable<any>{
    return this._ApiConfigService.postReq3(`dislikeRequestsSample` , '');
  }

  uploadFile(file:File): Observable<any> {
    return this._ApiConfigService.postReq3(`dislikeRequestsImport` , file);
  }

  getFiles(dislike_request_id:number): Observable<any> {
    return this._ApiConfigService.postReq3(`getDislikeRequestFiles` , {dislike_request_id});
  }
  
  uploadDislikeRequestFiles(file:File): Observable<any> {
    return this._ApiConfigService.postReq3(`uploadDislikeRequestFiles` , file);
  }
}