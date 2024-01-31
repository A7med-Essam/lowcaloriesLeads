import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ReportStaticsService {
  modelReport_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private _ApiConfigService: ApiConfigService) {}

  getModelFilteration(body: any): Observable<{
    data: {
      data: CustomerData[];
      count_data: BranchCount[];
    };
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`getCountChangeLocationMeal`, body);
  }

  getNewLeadFilteration(body: any): Observable<{
    data: NewLead;
    message: string;
    status: number;
  }> {
    return this._ApiConfigService.postReq3(`getCountChangeLocationMeal`, body);
  }
}

export interface CustomerData {
  CID: number;
  Cname: string;
  actionHappened?: string;
  deliveryName: string;
  CustomerPhone: string;
  CustomerEmail: string;
  planName: string;
  address: string;
  Agent?: string;
  branch: string;
  status?: string;
}

export interface BranchCount {
  count: number;
  Branch: string;
}

export interface NewLead {
  Calls?: number;
  Facebook?: number;
  Instagram?: number;
  Whatsapp?: number;
  Branches?: number;
  Web?: number;
  Mobile?: number;

  CustomerServices_subscribe?: number;
  CustomerServices_unSubscribe?: number;
  Clinic_subscribe?: number;
  Clinic_unSubscribe?: number;
}
