import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CallsService } from 'src/app/services/calls.service';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-add-call',
  templateUrl: './add-call.component.html',
  styleUrls: ['./add-call.component.scss'],
})
export class AddCallComponent implements OnInit {
  call: any;
  insertForm!: FormGroup;

  constructor(
    private _Router: Router,
    private _CallsService: CallsService,
    private _LocalService: LocalService
  ) {}

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.createRefundForm();
    this._CallsService.call.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res) => {
        if (res == null) {
          this._Router.navigate(['calls/show']);
        } else {
          this.call = res;
          this.createRefundForm(res);
        }
      },
    });
  }

  backBtn() {
    this._Router.navigate(['calls/show']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  createRefundForm(data?: any) {
    this.insertForm = new FormGroup({
      note: new FormControl(null),
      voice: new FormControl(null),
      call_id: new FormControl(data?.id),
      agent_uploaded: new FormControl(
        this._LocalService.getJsonValue('userInfo_oldLowCalories')?.id
      ),
      cid: new FormControl({ value: data?.cid, disabled: true }, [
        Validators.required,
      ]),
      subscription_id: new FormControl(
        { value: data?.subscription_id, disabled: true },
        [Validators.required]
      ),
      branch: new FormControl({ value: data?.branch, disabled: true }, [
        Validators.required,
      ]),
      customer_name: new FormControl(
        { value: data?.customer_name, disabled: true },
        [Validators.required]
      ),
      customer_mobile: new FormControl({
        value: data?.customer_mobile,
        disabled: true,
      }),
      customer_phone: new FormControl({
        value: data?.customer_phone,
        disabled: true,
      }),
      plan: new FormControl({ value: data?.plan, disabled: true }, [
        Validators.required,
      ]),
      date: new FormControl({ value: data?.date, disabled: true }, [
        Validators.required,
      ]),
    });
  }

  uploadingStatus: boolean = false;
  insert(form: FormGroup) {
    if (this.voiceFile) {
      if (form.valid) {
        this.uploadingStatus = true;
        const formData = new FormData();
        for (const key in this.insertForm.getRawValue()) {
          if (this.insertForm.getRawValue().hasOwnProperty(key)) {
            formData.append(key, this.insertForm.getRawValue()[key]);
          }
        }
        formData.append('voice', this.voiceFile ? this.voiceFile : '');
        this._CallsService.addCall(formData).subscribe((res) => {
          if (res.status == 1) {
            this.uploadingStatus = false;
            this.insertForm.reset();
            this._Router.navigate(['calls/show']);
          }
        });
      }
    }
  }

  // ====================================================================UPLOAD==========================================================================

  uploadFile() {
    let input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/mpeg';
    input.multiple = true;
    input.click();
    input.onchange = (e) => {
      this.onFileChange(e);
    };
  }
  voiceFile!: File | null;

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      this.voiceFile = event.target.files[0];
    }
  }

}
