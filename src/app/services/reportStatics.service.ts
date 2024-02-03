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
  CallRequests?: DataRequests[];
  CallSubscriptions?: DataSubscription[];
  Facebook?: number;
  Instagram?: number;
  SocialRequests?: DataRequests[];
  SocialSubscriptions?: DataSubscription[];
  Whatsapp?: number;
  WhatsappRequests?: DataRequests[];
  WhatsappSubscriptions?: DataSubscription[];
  Branches?: number;
  BranchSubscriptions?: DataSubscription[];
  Web?: number;
  Mobile?: number;
  OnlineSubscriptions?: DataSubscription[];

  CustomerServices_subscribe?: number;
  CustomerServices_subscribeSubscriptions?: DataSubscription[];
  CustomerServices_unSubscribe?: number;
  CustomerServices_unSubscribeSubscriptions?: DataSubscription[];
  Clinic_subscribe?: number;
  Clinic_subscribeSubscriptions?: DataSubscription[];
  Clinic_unSubscribe?: number;
  Clinic_unSubscribeSubscriptions?: DataSubscription[];
}

export interface DataRequests {
  id: number;
  date?: string;
  agent_id?: number;
  emirate_id?: number;
  customer_branch?: string;
  customer_name?: string;
  mobile?: string;
  emirate?: string;
  agent?: string;
}

export interface DataSubscription {
  id: number;
  status?: string;
  supscription_from?: string;
  invoice_no?: string;
  start_date?: string;
  total_price?: any;
  name?: string;
  mobile?: string;
  email?: string;
}
