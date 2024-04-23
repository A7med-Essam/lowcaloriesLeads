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
    });
  }

  patchForm(data: any) {
    this.updateForm.patchValue({
      cron_id: data.id,
      status: data.status,
      template_id: data.template_id,
      sender_id: data.sender_id,
      every_minutes: data.every_minutes,
    });
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
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
}
