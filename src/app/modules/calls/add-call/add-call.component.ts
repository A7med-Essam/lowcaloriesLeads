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
      files: new FormControl(null, [Validators.required]),
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
    if (form.valid) {
        this.uploadingStatus = true;
        this._CallsService.addCall(this.insertForm.getRawValue()).subscribe((res) => {
          if (res.status == 1) {
            this.uploadingStatus = false;
            this.insertForm.reset();
            this._Router.navigate(['calls/show']);
          }
        });
      }
  }

  // ====================================================================UPLOAD==========================================================================

  uploadFile() {
    let input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.multiple = true;
    input.click();
    input.onchange = (e) => {
      this.onFileChange(e);
    };
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const files = event.target.files;
      const readFile = (file: any) => {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = (event: any) => resolve(event.target.result);
          fileReader.onerror = (error) => reject(error);
          fileReader.readAsDataURL(file);
        });
      };

      const readFiles = async () => {
        try {
          const base64Strings = await Promise.all(
            Array.from(files).map(readFile)
          );

          const fileTypes = base64Strings.map((base64String: any) => {
            const type = base64String.split(',')[0].split(':')[1].split(';')[0];
            return { [type]: base64String };
          });

          this.insertForm.patchValue({
            files: fileTypes,
          });
        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }
}
