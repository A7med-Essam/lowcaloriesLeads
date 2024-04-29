import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SendBulkWhatsappService } from 'src/app/services/sendBulkWhatsapp.service';

@Component({
  selector: 'app-cron',
  templateUrl: './cron.component.html',
  styleUrls: ['./cron.component.scss'],
})
export class CronComponent implements OnInit {
  constructor(private _SendBulkWhatsappService: SendBulkWhatsappService) {}

  ngOnInit(): void {
    this.setUpdateForm();
    this.getCron();
    this.getTemps();
    this.getSenders();
  }
  today: Date = new Date();
  templates: any[] = [];
  senders: any[] = [];
  getTemps() {
    this._SendBulkWhatsappService.getWhatsAppSenderMessages().subscribe({
      next: (res) => {
        this.templates = res.data;
      },
    });
  }

  getSenders() {
    this._SendBulkWhatsappService.getSenders().subscribe({
      next: (res) => {
        this.senders = res.data;
      },
    });
  }

  crones: any[] = [];
  getCron() {
    this._SendBulkWhatsappService.getAllCrons().subscribe({
      next: (res) => {
        this.crones = res.data;
      },
    });
  }

  updateModal: boolean = false;
  updateRow(row: any) {
    this.patchForm(row);
    this.updateModal = true;
  }

  updateForm!: FormGroup;
  setUpdateForm() {
    this.updateForm = new FormGroup({
      cron_id: new FormControl({ value: null }, [Validators.required]),
      status: new FormControl({ value: null }, [Validators.required]),
      template_id: new FormControl({ value: null }, [Validators.required]),
      sender_id: new FormControl({ value: null }, [Validators.required]),
      every_minutes: new FormControl({ value: null }, [Validators.required]),
      initial_date: new FormControl({ value: null, disabled: true }),
    });
  }

  patchForm(data: any) {
    this.updateForm.patchValue({
      cron_id: data.id,
      status: data.status,
      template_id: data.template_id,
      sender_id: data.sender_id,
      every_minutes: data.every_minutes,
      // initial_date: new Date(data.initial_date),
    });
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      if (form.value.initial_date) {
        form.value.initial_date = this.convertDateFormat(
          form.value.initial_date
        );
      }
      this._SendBulkWhatsappService.updateCron(form.value).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.getCron();
            this.updateModal = false;
          }
        },
      });
    }
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  convertDateFormat(initialDate: string): string {
    const dateObj = new Date(initialDate);
    const formattedDate = `${dateObj.getFullYear()}-${this.padZero(
      dateObj.getMonth() + 1
    )}-${this.padZero(dateObj.getDate())} ${this.padZero(
      dateObj.getHours()
    )}:${this.padZero(dateObj.getMinutes())}:${this.padZero(
      dateObj.getSeconds()
    )}`;

    return formattedDate;
  }

  toggleFlag: boolean = false;
  toggleProperties() {
    this.toggleFlag = !this.toggleFlag;
    if (this.toggleFlag) {
      this.updateForm.get('initial_date')?.setValidators([Validators.required]);
      this.updateForm.get('initial_date')?.updateValueAndValidity();
      this.updateForm.get('every_minutes')?.clearValidators();
      this.updateForm.get('every_minutes')?.updateValueAndValidity();
      this.updateForm.get('initial_date')?.enable();
      this.updateForm.get('every_minutes')?.disable();
    } else {
      // every_minutes
      this.updateForm.get('initial_date')?.disable();
      this.updateForm.get('every_minutes')?.enable();
      this.updateForm.get('initial_date')?.clearValidators();
      this.updateForm.get('initial_date')?.updateValueAndValidity();
      this.updateForm
        .get('every_minutes')
        ?.setValidators([Validators.required]);
      this.updateForm.get('every_minutes')?.updateValueAndValidity();
    }
    this.updateForm.get('initial_date')?.setValue(null);
    this.updateForm.get('every_minutes')?.setValue(null);
  }
}
