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

  getAccountStatusAllFilteration(body: any): Observable<{
    data: {
      DEACTIVE: AccountStatusModel | null;
      ACTIVE: AccountStatusModel | null;
      RESTRICTED: AccountStatusModel | null;
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

  SocialMedia_export?: string;
  CallRequests_export?: string;
  WhatsappRequests_export?: string;
  OnlineSubscriptions_export?: string;
  BranchSubscriptions_export?: string;
  WhatsappSubscriptions_export?: string;
  CallSubscriptions_export?: string;
  CustomerServices_subscribeSubscriptions_export?: string;
  CustomerServices_unSubscribeSubscriptions_export?: string;
  Clinic_subscribeSubscriptions_export?: string;
  Clinic_unSubscribeSubscriptions_export?: string;

  Clinic_subscribeSubscriptions?: DataSubscription[];
  Clinic_unSubscribeSubscriptions?: DataSubscription[];
  CustomerServices_subscribeSubscriptions?: DataSubscription[];
  CustomerServices_unSubscribeSubscriptions?: DataSubscription[];

  CallSubscriptions?: DataSubscription[];
  SocialSubscriptions?: DataSubscription[];
  WhatsappSubscriptions?: DataSubscription[];
  BranchSubscriptions?: DataSubscription[];
  OnlineSubscriptions?: DataSubscription[];

  CallRequests?: DataRequests[];
  SocialMedia?: DataRequests[];
  WhatsappRequests?: DataRequests[];
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
  subscribed?: number;
}

export interface DataSubscription {
  id: number;
  status?: string;
  supscription_from?: string;
  invoice_no?: string;
  start_date?: string;
  total_price?: any;
  name?: string;
  customer_type?: string;
  mobile?: string;
  email?: string;
}

export interface AccountStatusItem {
  CID: number;
  branch: string;
  dstart: string;
  Cname: string;
  actionHappened: string;
  Agent: string;
  deliveryName: string;
  CustomerPhone: string;
  CustomerEmail: string;
  planName: string;
  address: string;
}
export interface CountDataAccountStatusItem {
  count: number;
  Branch: string;
}
export interface AccountStatusModel {
  data: AccountStatusItem[];
  count_data: CountDataAccountStatusItem[];
  total: number;
}
