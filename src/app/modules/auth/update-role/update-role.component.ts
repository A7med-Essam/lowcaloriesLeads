import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  styleUrls: ['./update-role.component.scss'],
})
export class UpdateRoleComponent implements OnInit, OnDestroy {
  @ViewChild('editForm', { static: false }) editForm!: ElementRef<any>;
  private unsubscribe$ = new Subject<void>();
  role: any;
  permissions: any;
  updateForm!: FormGroup;

  constructor(
    private _Router: Router,
    private _UsersService: UsersService,
    private _FormBuilder: FormBuilder,
    private _MessageService: MessageService
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
            role_id: this.role?.id,
            role_name: this.role?.name,
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
      display_name: new FormControl(null),
      role_name: new FormControl({ value: null, disabled: false }),
      permission_ids: new FormArray([], [Validators.required]),
    });
  }

  updateRole(form: FormGroup) {
    if (form.valid) {
      this.updateForm.patchValue({
        display_name:form.value?.role_name.toLowerCase().split(' ').map((word:string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        role_name: form.value?.role_name.replace(/\s/g, '_')
      });
      this._UsersService.updateRole(form.value).subscribe((res) => {
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Role Updated',
            detail: res.message,
          });
          this._Router.navigate(['users/roles']);
        }
      });
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

  onCheckAllChange(el: any, event: any) {
    const siblings = this.getAllSiblings(el, el?.parentElement);
    let formArray: FormArray = this.updateForm.get(
      'permission_ids'
    ) as FormArray;

    siblings.forEach((s) => {
      const firstChild = s.children[0];
      const firstChildValue = firstChild?.value;

      if (event.target.checked) {
        firstChild.checked = true;

        const isControlExists = formArray.controls.some(
          (control) => control.value === firstChildValue
        );

        if (!isControlExists) {
          formArray.push(new FormControl(firstChildValue));
        }
      } else {
        const controlIndex = formArray.controls.findIndex(
          (control) => control.value === firstChildValue
        );
        if (controlIndex !== -1) {
          formArray.removeAt(controlIndex);
        }

        firstChild.checked = false;
      }
    });
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

  getAssignedPermisstions(e: ElementRef) {
    const PermissionsList = e.nativeElement.querySelectorAll(
      "input[type='checkbox'][name='check']"
    );
    const FormArray: FormArray = this.updateForm.get(
      'permission_ids'
    ) as FormArray;
    PermissionsList.forEach((e: HTMLInputElement) => (e.checked = false));
    for (let i = 0; i < this.role?.role_permissions.length; i++) {
      for (let j = 0; j < PermissionsList.length; j++) {
        if (
          this.role?.role_permissions[i]?.permission.id ==
          PermissionsList[j].value
        ) {
          PermissionsList[j].checked = true;
          FormArray.push(new FormControl(PermissionsList[j].value));
        }
      }
    }
  }

  getAllSiblings(element: any, parent: any) {
    const children = [...parent.children];
    return children.filter((child) => child !== element);
  }
}
