import { Location } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GiftcodeService } from 'src/app/services/giftcode.service';

@Component({
  selector: 'app-update-giftcode',
  templateUrl: './update-giftcode.component.html',
  styleUrls: ['./update-giftcode.component.scss'],
})
export class UpdateGiftcodeComponent implements OnInit, OnDestroy {
  updateForm!: FormGroup;
  flag: string[] = ['Branches', 'Head Office'];
  status: string[] = ['active', 'notActive'];
  @ViewChildren('checkbox') checkboxElements!: QueryList<Checkbox>;
  currentRow: any;

  constructor(
    private _Location: Location,
    private _GiftcodeService: GiftcodeService,
    private _MessageService: MessageService,
    private _Router: Router
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.createUpdateForm();
    this._GiftcodeService.giftcode
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['giftcode/show']);
          } else {
            this.currentRow = res;
            this.getPrograms();
            this.createUpdateForm(res);
          }
        },
      });
  }

  createUpdateForm(res?: any) {
    this.updateForm = new FormGroup({
      code_id: new FormControl(res?.id, [Validators.required]),
      code: new FormControl(res?.code, [Validators.required]),
      percentage: new FormControl(res?.percentage, [Validators.required]),
      no_of_use: new FormControl(res?.no_of_use, [Validators.required]),
      expired_at: new FormControl(
        res?.expired_at ? new Date(res?.expired_at) : null,
        [Validators.required]
      ),
      status: new FormControl(res?.status, [Validators.required]),
      flag: new FormControl(res?.flag, [Validators.required]),
      programs: new FormArray([], [Validators.required]),
    });
  }

  updateRow(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        expired_at: new Date(form.value.expired_at).toLocaleDateString('en-CA'),
      });
      this._GiftcodeService.updateGiftCode(form.value).subscribe((res) => {
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Giftcode Form',
            detail: 'Giftcode Added successfully',
          });
          this._Location.back();
        }
      });
    }
  }

  goBack(): void {
    this._Location.back();
  }

  programs: any[] = [];
  getPrograms() {
    this._GiftcodeService.getPrograms().subscribe((res) => {
      this.programs = res.data;
      setTimeout(() => {
        this.getSelectedPrograms();
      }, 1);
    });
  }

  onCheckboxChange(event: any, value: string) {
    let formArray: FormArray = this.updateForm.get('programs') as FormArray;
    if (event.checked.length) {
      formArray.push(new FormControl(event.checked[0]));
    } else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: any) => {
        if (ctrl.value === value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  getSelectedPrograms() {
    const programIds = this.currentRow.programs.map((program:any) => program.program_id);
    const FormArray = this.updateForm.get('programs') as FormArray;
    this.checkboxElements.forEach((checkbox: Checkbox) => {
      const isChecked = programIds.includes(Number(checkbox.value));
      if (isChecked) {
        checkbox.updateModel(isChecked);
        FormArray.push(new FormControl(checkbox.value));
      } else {
        checkbox.writeValue(isChecked);
        const index = FormArray.controls.findIndex(
          (control) => control.value === checkbox.value
        );
        if (index !== -1) {
          FormArray.removeAt(index);
        }
      }
    });

    const UNIQUE_VALUES = [...new Set(this.updateForm.get('programs')?.value)];
    FormArray.clear();
    UNIQUE_VALUES.forEach(v => {
      FormArray.push(new FormControl(v));
    });
  }
}
