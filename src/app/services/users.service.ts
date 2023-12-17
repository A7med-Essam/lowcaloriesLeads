import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ApiConfigService } from "../core/api-config.service";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(private _ApiConfigService: ApiConfigService) {}

  agent:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  role:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  getAgents(): Observable<any> {
    return this._ApiConfigService.postReq3("getAgents", "");
  }

  addAgent(agent:any): Observable<any> {
    return this._ApiConfigService.postReq3("addAgent", agent);
  }

  deleteAgent(agent_id :number): Observable<any> {
    return this._ApiConfigService.postReq3("deleteAgent", {agent_id});
  }

  getPermissions(): Observable<any> {
    return this._ApiConfigService.postReq3("permissions", "");
  }

  updateAgent(agent:any): Observable<any> {
    return this._ApiConfigService.postReq3("addUpdateAgentPermissions", agent);
  }

  getRoles(): Observable<any> {
    return this._ApiConfigService.postReq3("roles", "");
  }

  updateRole(role:any): Observable<any> {
    return this._ApiConfigService.postReq3("addOrUpdatePermissionRole", role);
  }

  getPermissionRoles(): Observable<any> {
    return this._ApiConfigService.postReq3("permission_roles", "");
  }

  addRoles(role:any): Observable<any> {
    return this._ApiConfigService.postReq3("addRoles", role);
  }

  deleteRole(role_id:number): Observable<any> {
    return this._ApiConfigService.postReq3("deleteRoles", {role_id});
  }

  getTeams(): Observable<any> {
    return this._ApiConfigService.postReq3("getAgentTeams", "");
  }

  getCustomerModels(phone_number:number): Observable<any> {
    return this._ApiConfigService.postReq3(`getCustomerModels`,{phone_number});
  }
}
