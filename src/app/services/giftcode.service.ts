import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class GiftcodeService {

  constructor(
    private _ApiConfigService: ApiConfigService
  )  { }

  createGiftCode(code:any): Observable<any> {
    return this._ApiConfigService.postReq3(`createCodeOnManager`,code);
  }
}
