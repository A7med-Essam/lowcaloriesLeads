import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentlinkService {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }

  getPaymentDetails(): Observable<PaymentDetailsResponse> {
    return this._ApiConfigService.postReq3(`getPaymentDetails`, '');
  }

  create_payment_link(payment:PaymentData): Observable<{
    status:  number;
    message: string;
    data:    string;
  }> {
    return this._ApiConfigService.postReq3(`create_payment_link`, payment);
  }

  print_payment_link(payment:PaymentData): Observable<{
    status:  number;
    message: string;
    data:    any;
  }> {
    return this._ApiConfigService.postReq3(`create_payment_complete`, payment);
  }

  checkMobileEmails(mobile:string): Observable<any>{
    return this._ApiConfigService.postReq3(`getEmailsByMobile`, {mobile});
  }
}



export interface PaymentDetailsResponse {
  status:  number;
  message: string;
  data:    PaymentDetails;
}

export interface PaymentDetails {
  Programs:  Programs;
  GiftCodes: GiftCode[];
  disLikes:  Branch[];
  emirates:  Emirate[];
  branches:  Branch[];
}

export interface GiftCode {
  id:         number;
  code:       string;
  percentage: string;
}

export interface Programs {
  [key: string]: Program[];
}

export interface Program {
  id:             number;
  company:        string;
  name:           string;
  max_meals:      number;
  no_snacks:      number;
  bag_price:      number;
  snack_price:    number;
  shortcut_name:  string;
  plans:          Plan[];
}

export interface Plan {
  id:          number;
  program_id:  number;
  name:        string;
  name_ar:     string;
  no_meals:    number;
  plan_prices: PlanPrices;
  details:     Details;
  myprogram:   Myprogram;
}

export interface Details {
  max_meal:  number;
  max_snack: number;
  max_days:  number;
  min_days:  number;
}

export interface Myprogram {
  id:             number;
  active:         number;
  type:           string;
  company:        string;
  name:           string;
  name_ar:        string;
  description:    string;
  description_ar: string;
  image:          string;
  order_number:   number;
  max_meals:      number;
  no_snacks:      number;
  shortcut_name:  null;
  image_new:      string;
  bag_price:      number;
  snack_price:    number;
}

export interface PlanPrices {
  one_meal:   number;
  two_meal:   number;
  three_meal: number;
  four_meal:  number;
  five_meal:  number;
  six_meal:   number;
}

export interface Branch {
  id:   number;
  name: string;
}

export interface Emirate {
  id:           number;
  en_name:      string;
  ar_name:      string;
  inbody_price: number;
}


export interface PaymentData {
  first_name:           string;
  last_name:            string;
  phone_number:         string;
  email:                string;
  gender:               string;
  height:               number;
  Weight:               number;
  birthday:             Date;
  program_id:           number;
  plan_id:              number;
  meal_types:           string[];
  snack_types:          string[];
  subscription_days:    number;
  start_date:           Date;
  delivery_days:        string[];
  emirate_id:           number;
  area:                 string;
  address:              string;
  code_id:              number;
  bag:                  string;
  cutlery:              string;
  exchange_paymentLink: string;
  dislike:              string;
}
