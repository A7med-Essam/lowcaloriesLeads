import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-update-users',
  templateUrl: './update-users.component.html',
  styleUrls: ['./update-users.component.scss'],
})
export class UpdateUsersComponent implements OnInit, OnDestroy {
  @ViewChild("editForm", { static: false }) editForm!: ElementRef<any>;
  private unsubscribe$ = new Subject<void>();
  agent: any;
  permissions: any;
  teams: any[] = [];
  updateForm!: FormGroup;

  constructor(
    private _Router: Router,
    private _UsersService: UsersService,
    private _FormBuilder: FormBuilder,
    private _MessageService:MessageService
  ) {}

  ngOnInit(): void {
    this.createUpdateForm();
    this._UsersService.agent.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res) => {
        if (res == null) {
          this._Router.navigate(['users/show']);
        } else {
          this.agent = res;
          this.getPermissions();
          this.getTeams();
          this.updateForm.patchValue({
            email: this.agent.email,
            name: this.agent.name,
            team: this.agent.team,
            agent_id:this.agent.id
          });
        }
      },
    });
  }

  backDetailsBtn() {
    this._Router.navigate(['users/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  createUpdateForm() {
    this.updateForm = this._FormBuilder.group({
      agent_id: new FormControl(null),
      email: new FormControl({ value: null, disabled: true }),
      name: new FormControl({ value: null, disabled: true }),
      team: new FormControl({ value: null }),
      permissions: new FormArray([], [Validators.required]),
    });
  }

  updateAgent(form: FormGroup) {
    if (form.valid) {
      this._UsersService.updateAgent(form.value).subscribe(res=>{
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Agent Updated',
            detail: res.message,
          });
          this._Router.navigate(['users/show']);
        }
      })
    }
    else{
      this._MessageService.add({
        severity: 'success',
        summary: 'Can not update agent',
        detail: 'Agent Should have at least one permission',
      });
    }
  }

  onCheckChange(event: any) {
    let formArray: FormArray;
    formArray = this.updateForm.get('permissions') as FormArray;

    if (event.target.checked)
      formArray.push(new FormControl(event.target.value));
    else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: any) => {
        if (ctrl.value == event.target.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  getPermissions() {
    this._UsersService.getPermissions().subscribe((res) => {
      this.permissions = res.data;
      setTimeout(() => {
        this.getAssignedPermisstions(this.editForm);
      }, 1);
    });
  }

  getObjectKeys(obj: object): string[] {
    if (obj) {
      return Object.keys(obj);
    }
    return [];
  }

  getAssignedPermisstions(e:ElementRef) {
    const PermissionsList = e.nativeElement.querySelectorAll(
      "input[type='checkbox']"
    );
    const FormArray: FormArray = this.updateForm.get(
      "permissions"
    ) as FormArray;
    PermissionsList.forEach((e:HTMLInputElement) => (e.checked = false));
    for (let i = 0; i < this.agent?.permissions.length; i++) {
      for (let j = 0; j < PermissionsList.length; j++) {
        if (this.agent?.permissions[i]?.permission == PermissionsList[j].value) {
          PermissionsList[j].checked = true;
          FormArray.push(new FormControl(PermissionsList[j].value));
        }
      }
    }
  }

  getTeams() {
    this._UsersService.getTeams().subscribe((res) => {
      this.teams = res.data;
    });
  }
}
