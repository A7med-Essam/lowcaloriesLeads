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
  selector: 'app-update-role',
  templateUrl: './update-role.component.html',
  styleUrls: ['./update-role.component.scss']
})
export class UpdateRoleComponent  implements OnInit, OnDestroy {
  @ViewChild("editForm", { static: false }) editForm!: ElementRef<any>;
  private unsubscribe$ = new Subject<void>();
  role: any;
  permissions: any;
  updateForm!: FormGroup;

  constructor(
    private _Router: Router,
    private _UsersService: UsersService,
    private _FormBuilder: FormBuilder,
    private _MessageService:MessageService
  ) {}

  ngOnInit(): void {
    this.createUpdateForm();
    this._UsersService.role.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res) => {
        if (res == null) {
          this._Router.navigate(['users/roles']);
        } else {
          this.role = res;
          this.getPermissionRoles();
          this.updateForm.patchValue({
            role_id:this.role.id,
            name: this.role.name,
          });
        }
      },
    });
  }

  backDetailsBtn() {
    this._Router.navigate(['users/roles']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  createUpdateForm() {
    this.updateForm = this._FormBuilder.group({
      role_id: new FormControl(null),
      name: new FormControl({ value: null, disabled: true }),
      permission_ids: new FormArray([], [Validators.required]),
    });
  }

  updateRole(form: FormGroup) {
    if (form.valid) {
      this._UsersService.updateRole(form.value).subscribe(res=>{
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Role Updated',
            detail: res.message,
          });
          this._Router.navigate(['users/roles']);
        }
      })
    }
  }

  onCheckChange(event: any) {
    let formArray: FormArray;
    formArray = this.updateForm.get('permission_ids') as FormArray;

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

  getPermissionRoles() {
    this._UsersService.getPermissionRoles().subscribe((res) => {
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
      "permission_ids"
    ) as FormArray;
    PermissionsList.forEach((e:HTMLInputElement) => (e.checked = false));
    for (let i = 0; i < this.role?.role_permissions.length; i++) {
      for (let j = 0; j < PermissionsList.length; j++) {
        if (this.role?.role_permissions[i]?.permission.id == PermissionsList[j].value) {
          PermissionsList[j].checked = true;
          FormArray.push(new FormControl(PermissionsList[j].value));
        }
      }
    }
  }
}
