import { Injectable } from '@angular/core';
import { ApiConfigService } from '../core/api-config.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  subscription: BehaviorSubject<Subscriptions|null> = new BehaviorSubject<Subscriptions|null>(null);
  subscription_filter: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }

  getSubscriptions(page: number): Observable<ISubscriptionsResponse> {
    return this._ApiConfigService.postReq3(`getSubscriptions?page=${page}`, '');
  }

  
  getAllSubscriptions(): Observable<{status:number,data:Subscriptions[],message:string}> {
    return this._ApiConfigService.postReq3(`getSubscriptions`, {withoutPagination:true});
  }

  filterSubscriptions(page: number,filter:any): Observable<ISubscriptionsResponse>{
    return this._ApiConfigService.postReq3(`getSubscriptions?page=${page}`, filter);
  }

  exportAll(): Observable<any> {
    return this._ApiConfigService.postReq3(`SubscriptionsExport`, '');
  }
  
  // TODO: check subscriptionIds
  exportByIds(subscriptionIds:number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`SubscriptionsExportByIds`, {subscriptionIds});
  }
}


export interface ISubscriptionsResponse {
  status:  number;
  message: string;
  data:    Data;
}

export interface Data {
  current_page:   number;
  data:           Subscriptions[];
  first_page_url: string;
  from:           number;
  last_page:      number;
  last_page_url:  string;
  next_page_url:  string;
  path:           string;
  per_page:       number;
  prev_page_url:  null;
  to:             number;
  total:          number;
}

export interface Subscriptions {
  id:                                number;
  version:                           Version;
  deleted:                           number;
  status:                            string;
  sub_from:                          SubFrom;
  order_id:                          null;
  user_id:                           number;
  program_id:                        number;
  plan_id:                           number | null;
  custom:                            Branch | null;
  option_id:                         number | null;
  location_id:                       number;
  erp_location:                      null;
  code_id:                           number | null;
  code:                              null;
  price:                             number;
  vat:                               string;
  cutlery:                           Cutlery;
  bag:                               number;
  total_price:                       number;
  delivery_starting_day:             Date;
  days_of_week:                      string;
  dislike:                           string;
  dis_like_user:                     null | string;
  note:                              null;
  order_notes:                       null;
  subscriptions_note:                string;
  full_plan_name:                    string;
  invoice_no:                        string;
  mastercard_session_id:             null | string;
  mastercard_session_version:        null | string;
  mastercard_successIndicator:       null | string;
  mastercard_result_session_version: null | string;
  mastercard_resultIndicator:        null | string;
  mode:                              number;
  branch:                            Branch;
  branch_paid_on_id:                 number | null;
  branch_invoice_image:              null | string;
  agent_id:                          number | null;
  updated_text:                      null | string;
  created_date:                      Date;
  created_time:                      number;
  subscription_days:                 SubscriptionDay[];
  cids:                              null;
}

export enum Branch {
  No = "no",
  Yes = "yes",
}

export enum Cutlery {
  Checked = "checked",
  NotChecked = "Not Checked",
}

export enum SubFrom {
  Branch = "Branch",
  Exchange = "exchange",
  Mobile = "mobile",
  PaymentLink = "payment link",
  Web = "web",
}

export interface SubscriptionDay {
  id:              number;
  status:          string;
  updated:         number;
  subscription_id: number;
  day:             string;
  date:            Date;
  location_id:     number;
  day_meals:       DayMeal[];
}

export interface DayMeal {
  id:                  number;
  subscription_day_id: number;
  meal_id:             number;
  meal_name:           null | string;
  snack_name:          null;
  meal_unit:           MealUnit;
  side_unit:           MealUnit | null;
  max_main:            number | null;
  max_side:            number | null;
  type:                string;
  meal:                Meal;
}

export interface Meal {
  id:               number;
  program_id:       number;
  plan_id:          number;
  category_meal_id: number;
  level:            string;
  name:             string;
  name_ar:          string;
  description:      string;
  description_ar:   string;
  type:             string;
  meal_unit:        MealUnit;
  side_unit:        MealUnit;
  max_meal:         number;
  max_side:         number;
  image:            string;
  image_web:        string;
}

export enum MealUnit {
  Gm = "GM",
  Pcs = "PCS",
}

export enum Version {
  V1 = "v1",
  V3 = "v3",
}
