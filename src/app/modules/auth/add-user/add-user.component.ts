import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnInit {
  insertForm!: FormGroup;
  teams: any[] = [];
  branches: any[] = [];
  // roles_permission: any[] = [];
  userType :string[] = ['agent','super_admin']
  roles :any[] = [
    {
      name:"HeadOffice", value:0
    },
    {
      name:"Branches", value:1
    },
    {
      name:"accounting", value:3
    }
  ]
  constructor(
    private _Location: Location,
    private _UsersService: UsersService,
    private _MessageService: MessageService,
    private _AgentTargetService: AgentTargetService,
    private _DislikeService: DislikeService
  ) {}

  ngOnInit(): void {
    this.createUserForm();
    this.getTargetOptions();
    this.getAgentBranches();
    // this.getRoles();
  }

  getTargetOptions() {
    this._AgentTargetService.getTargetOptions().subscribe((res) => {
      this.teams = res.data.teams;
    });
  }

  getAgentBranches() {
    this._DislikeService
      .getAgentBranches()
      .subscribe((res) => (this.branches = res.data));
  }

  // getRoles() {
  //   this._UsersService.getRoles().subscribe((res) => {
  //     this.roles_permission = res.data;
  //   });
  // }

  createUserForm() {
    this.insertForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      login_email: new FormControl(null, [Validators.required]),
      agent_email: new FormControl(null, [Validators.required]),
      agent_id_on_kot: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      team: new FormControl(null, [Validators.required]),
      branch_id: new FormControl(null, [Validators.required]),
      role_name: new FormControl(null, [Validators.required]), //agent - super_admin
      // web_role: new FormControl(null, [Validators.required]), // roles
      role: new FormControl(null, [Validators.required]), // office - agent branch - accounting
      // permissions: new FormControl(null, [Validators.required]),
    });
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      this._UsersService.addAgent(form.value).subscribe((res) =>{
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Agent Form',
            detail: 'New Agent Added successfully',
          });
          this._Location.back();
        }
      })
    }
  }

  goBack(): void {
    this._Location.back();
  }
}
