import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { GiftcodeService } from 'src/app/services/giftcode.service';

@Component({
  selector: 'app-create-giftcode',
  templateUrl: './create-giftcode.component.html',
  styleUrls: ['./create-giftcode.component.scss'],
})
export class CreateGiftcodeComponent implements OnInit {
  insertForm!: FormGroup;
  flag: string[] = ['Branches', 'Head Office'];
  status: string[] = ['active', 'notActive'];

  constructor(
    private _Location: Location,
    private _GiftcodeService: GiftcodeService,
    private _MessageService: MessageService
  ) {}

  ngOnInit(): void {
    this.createUserForm();
    this.getPrograms();
  }

  createUserForm() {
    this.insertForm = new FormGroup({
      code: new FormControl(null, [Validators.required]),
      percentage: new FormControl(null, [Validators.required]),
      no_of_use: new FormControl(null, [Validators.required]),
      expired_at: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      flag: new FormControl(null, [Validators.required]),
      programs: new FormArray([], [Validators.required]),
    });
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        expired_at: new Date(form.value.expired_at).toLocaleDateString('en-CA'),
      });
      this._GiftcodeService.createGiftCode(form.value).subscribe((res) =>{
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Giftcode Form',
            detail: 'Giftcode Added successfully',
          });
          this._Location.back();
        }
      })
    }
  }

  goBack(): void {
    this._Location.back();
  }

  programs: any[] = [];
  getPrograms() {
    this._GiftcodeService.getPrograms().subscribe((res) => {
      this.programs = res.data;
    });
  }

  onCheckboxChange(event: any, value: string) {
    let formArray: FormArray = this.insertForm.get('programs') as FormArray;
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
}
