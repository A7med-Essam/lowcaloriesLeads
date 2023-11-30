import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class EnquiryService {
  constructor(private _ApiConfigService: ApiConfigService) {}

  calculate(data: any): Observable<any> {
    return this._ApiConfigService.postReq3(`getPlanDetails`, data);
  }
}
