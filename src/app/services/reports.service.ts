import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../core/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private _ApiConfigService: ApiConfigService) {}

  getAgentLogs(agent: any): Observable<any> {
    agent.withoutPagination = true;
    return this._ApiConfigService.postReq3(`getAgentLogs`, agent);
  }
}
