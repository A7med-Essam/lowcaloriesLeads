import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ApiConfigService } from "../core/api-config.service";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  constructor(private _ApiConfigService: ApiConfigService) {}

  agent:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  getAgents(): Observable<any> {
    return this._ApiConfigService.postReq3("getAgents", "");
  }

  // getSuperAdmins(): Observable<any> {
  //   return this._ApiConfigService.postReq("superAdmins", "");
  // }

  // updateAdmin(user:any): Observable<any> {
  //   return this._ApiConfigService.postReq("updateAdmin", user);
  // }

  // deleteAdmin(user:any): Observable<any> {
  //   return this._ApiConfigService.postReq("deleteAdmin", user);
  // }

  // createAdmin(user:any): Observable<any> {
  //   return this._ApiConfigService.postReq("adminRegister", user);
  // }

  // createSuperAdmin(user:any): Observable<any> {
  //   return this._ApiConfigService.postReq("register", user);
  // }

  getPermissions(): Observable<any> {
    return this._ApiConfigService.postReq3("permissions", "");
  }

  // promoteAdmin(admin_id:any): Observable<any> {
  //   return this._ApiConfigService.postReq("upgradeAdmin", { admin_id: admin_id });
  // }

  // unPromoteAdmin(super_admin_id:any): Observable<any> {
  //   return this._ApiConfigService.postReq("downgradeAdmin", {
  //     super_admin_id: super_admin_id,
  //   });
  // }

  
  updateAgent(agent:any): Observable<any> {
    return this._ApiConfigService.postReq3("addUpdateAgentPermissions", agent);
  }

}
