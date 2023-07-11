import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: any[] = [];
  addRoleModal:boolean = false;

  constructor(private _UsersService: UsersService, private _Router: Router) {}

  ngOnInit(): void {
    this.getRoles();
  }

  updateRole(role: any) {
    if (role) {
      this._UsersService.role.next(role);
      this._Router.navigate(['users/update-role']);
    }
  }

  getRoles() {
    this._UsersService.getRoles().subscribe((res) => {
      this.roles = res.data;
    });
  }

  addNewRole(input:any){
    const role = {
      name: input.value.replace(/\s/g, '_'),
      display_name:input.value
    }
    this._UsersService.addRoles(role).subscribe(res=>{
      if (res.status == 1) {
        this.getRoles();
        this.addRoleModal = false;
      }
    })
  }

  deleteRole(id:number){
    this._UsersService.deleteRole(id).subscribe(res=>{
      if (res.status == 1) {
        this.getRoles();
      }
    })
  }

}