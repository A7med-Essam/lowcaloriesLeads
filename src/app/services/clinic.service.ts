import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';
@Injectable({
  providedIn: 'root',
})
export class ClinicService {
  constructor(private _ApiConfigService: ApiConfigService) {}


  getEmirateAppointments(): Observable<IEmirateAppointmentsResponse> {
    return this._ApiConfigService.postReq2(`getEmirateAppointments`, '');
  }

  bookAppointmentInClinic(data: IBookAppointmentInClinicData): Observable<{status:number,data:string,message:string}> {
    return this._ApiConfigService.postReq2(`bookAppointmentInClinic`, data);
  }

  exportByIds(clinicIds:number[]): Observable<any> {
    return this._ApiConfigService.postReq3(`ClinicExportByIds`, {clinicIds});
  }
}

export interface IBookAppointmentInClinicData {
  first_name:   string;
  email:        string;
  whatsApp:     string;
  phone_number: string;
  emirate_id:   number;
  day:          string;
  date:         string;
  time_id:      number;
  max_people:   number;
  address:      string;
  last_name:    string;
}


export interface IEmirateAppointmentsResponse {
  status:  number;
  message: string;
  data:    IEmirateAppointments[];
}

export interface IEmirateAppointments {
  id:           number;
  en_name:      string;
  ar_name:      string;
  inbody_price: string;
  appointments: IAppointment[];
}

export interface IAppointment {
  id:         number;
  type:       string;
  emara_id:   number;
  day:        string;
  date:       Date;
  max_people: number;
  times:      ITime[];
  dateDay?: string
}

export interface ITime {
  id:                     number;
  emirate_appointment_id: number;
  time_from:              string;
  time_to:                string;
  booked:                 number;
}
