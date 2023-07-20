import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AgentTargetService {
  target: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private _ApiConfigService: ApiConfigService
  ) { }

  getTargets(page: number): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`targetRequests?page=${page}`, '');
  }

  filterTargets(page: number,filter:any){
    return this._ApiConfigService.postReq3(`targetRequests?page=${page}`, filter);
  }

  addTarget(target:ITarget): Observable<{status:number,data:ITarget,message:string}> {
    return this._ApiConfigService.postReq3(`addTargetRequest`, target);
  }

  getSubDetails(mobile:number): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`getSubDetails`, {mobile});
  }

  exportAll(): Observable<any> {
    return this._ApiConfigService.postReq3(`TargetExport`,'');
  }

  exportByIds(targetIds:number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`TargetExportByIds`, {targetIds});
  }

  getTargetOptions():Observable<any>{
    return this._ApiConfigService.postReq3(`targetRequestDetails`, '');
  }

  getCustomerCIDS(phone: string): Observable<any> {
    return this._ApiConfigService.getReq2(`Subscription/GetCid?phone=${phone}`);
  }

  getAllTargets(): Observable<{status:number,data:any,message:string}> {
    return this._ApiConfigService.postReq3(`targetRequests`, {withoutPagination:true});
  }

  getSample(): Observable<any>{
    return this._ApiConfigService.postReq3(`target/sample` , '');
  }

  uploadFile(file:File): Observable<any> {
    return this._ApiConfigService.postReq3(`target/import` , file);
  }
}

export interface ITarget{
  team:          string;
  agent_id:      number;
  date:          string;
  client_number: number;
  client_cid:    number;
  emirate:       string;
  branch:        string;
  case:          string;
  action:        string;
  status:        string;
  notes:         string;
}