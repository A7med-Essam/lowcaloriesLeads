import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dropdown } from 'primeng/dropdown';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-show-users',
  templateUrl: './show-users.component.html',
  styleUrls: ['./show-users.component.scss'],
})
export class ShowUsersComponent implements OnInit {
  agents: any[] = [];
  cloneAgents: any[] = [];
  roles: any[] = [];
  addRoleModal: boolean = false;

  constructor(private _UsersService: UsersService, private _Router: Router) {}

  ngOnInit(): void {
    this.getRoles();
    this.getAgents();
  }

  getAgents() {
    this._UsersService.getAgents().subscribe((res) => {
      this.cloneAgents = this.agents = res.data;
    });
  }

  search(e: HTMLInputElement) {
    setTimeout(() => {
      const searchValue = e.value.trim().toUpperCase();
      if (searchValue) {
        this.agents = this.cloneAgents.filter(
          (agent) =>
            agent.name.toUpperCase().includes(searchValue) ||
            agent.team.toUpperCase().includes(searchValue) ||
            agent.role_name.toUpperCase().includes(searchValue) ||
            (agent.status &&
              agent.status.toUpperCase().includes(searchValue)) ||
            agent.permissions.some((permission: any) =>
              permission.permission.toUpperCase().includes(searchValue)
            )
        );
      } else {
        this.agents = [...this.cloneAgents];
      }
    }, 1);
  }

  updateAgent(agent: any) {
    if (agent) {
      this._UsersService.agent.next(agent);
      this._Router.navigate(['users/update']);
    }
  }

  getRoles() {
    this._UsersService.getRoles().subscribe((res) => {
      this.roles = res.data;
    });
  }

  currentAgent: any;
  getCurrentAgent(agent: any) {
    this.currentAgent = agent;
    this.addRoleModal = true;
  }

  addRole(input: Dropdown) {
    let permissions: string[] = [];
    input.value.role_permissions.forEach((p: any) => {
      if (p.permission?.name) {
        permissions.push(p.permission.name);
      }
    });
    const updateData = {
      agent_id: this.currentAgent.id,
      role_name: input.value.name,
      permissions,
    };
    this._UsersService.updateAgent(updateData).subscribe((res) => {
      this.getAgents();
      this.addRoleModal = false;
    });
  }
}
