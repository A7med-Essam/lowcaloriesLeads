import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class CallsService {
  constructor(private _ApiConfigService: ApiConfigService) {}

  getCalls(page: number): Observable<{
    status: number;
    data: {
      data: ICalls[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      next_page_url: string;
      path: string;
      per_page: number;
      prev_page_url: string;
      to: number;
      total: number;
    };
    message: string;
  }> {
    return this._ApiConfigService.postReq3(`calls?page=${page}`, '');
  }

  getAllCalls():Observable<any>{
    return this._ApiConfigService.postReq3(`calls`, {
      withoutPagination:true
    });
  }

  assignCalls(info:{call_id:number,user_ids:number[]}): Observable<any>{
    return this._ApiConfigService.postReq3(`assign`, info);
  }

  assignMultiCalls(info:{call_ids:number[],user_id:number}): Observable<any>{
    return this._ApiConfigService.postReq3(`assignMultiCallForAgent`, info);
  }

  export(): Observable<any>{
    return this._ApiConfigService.postReq3(`exportCalls`, '');
  }

  filterCalls(page: number,filter:any){
    return this._ApiConfigService.postReq3(`calls?page=${page}`, filter);
  }
}

export interface ICalls {
  id: number;
  cid: string;
  subscription_id: number;
  branch: string;
  customer_name: string;
  customer_mobile: string;
  customer_phone: string;
  plan: string;
  date: Date;
  note: null;
  voice: null;
  agent_uploaded: null;
  created_at: Date;
  updated_at: Date;
  call_users: any[];
}
