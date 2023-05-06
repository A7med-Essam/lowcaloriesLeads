import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ClinicService,
  IAppointment,
  IEmirateAppointments,
  ITime,
} from 'src/app/services/clinic.service';
import { SurveyService } from 'src/app/services/survey.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-create-clinic-link',
  templateUrl: './create-clinic-link.component.html',
  styleUrls: ['./create-clinic-link.component.scss'],
})
export class CreateClinicLinkComponent implements OnInit {
  insertForm!: FormGroup;
  PaymentLink!: string;

  constructor(
    private _ClinicService: ClinicService,
    private _MessageService: MessageService
  ) {}

  ngOnInit(): void {
    this.setInsertForm();
    this.getEmirateAppointments();
  }

  insertRow(insertForm: FormGroup) {
    if (insertForm.valid) {
      console.log(insertForm.value);
      const day = this.appointments.filter(
        (e) => e.id == insertForm.value.date_id
      )[0].day;
      const date = this.appointments.filter(
        (e) => e.id == insertForm.value.date_id
      )[0].date;
      insertForm.get('day')?.setValue(day);
      insertForm.get('date')?.setValue(date);
      this._ClinicService
        .bookAppointmentInClinic(insertForm.value)
        .subscribe((res) => {
          if (res.status == 1) {
            this.PaymentLink = res.data;
            insertForm.reset();
            this._MessageService.add({
              severity: 'success',
              summary: 'Booked Successfully',
              detail: "Payment link returned successfully",
            });
          }
        });
    }
  }

  setInsertForm() {
    this.insertForm = new FormGroup({
      first_name: new FormControl(null, [Validators.required]),
      last_name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      whatsApp: new FormControl(null, [Validators.required]),
      phone_number: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      emirate_id: new FormControl(null, [Validators.required]),
      date_id: new FormControl(null, [Validators.required]),
      time_id: new FormControl(null, [Validators.required]),
      max_people: new FormControl(null, [Validators.required]),
      date: new FormControl(null),
      day: new FormControl(null),
    });
  }

  emirates: IEmirateAppointments[] = [];
  appointments: IAppointment[] = [];
  times: ITime[] = [];
  getEmirateAppointments() {
    this._ClinicService.getEmirateAppointments().subscribe({
      next: (res) => {
        res.data.map((data) =>
          data.appointments.map((app) => {
            app.dateDay = app.date + ' - ' + app.day;
            app.times.map(
              (time) => (time.time_from = time.time_from + ' - ' + time.time_to)
            );
          })
        );
        this.emirates = res.data;
      },
    });
  }

  onSelectEmirate(id: number) {
    this.appointments = [];
    this.times = [];
    if (id) {
      this.appointments = this.emirates.filter(
        (e) => e.id == id
      )[0].appointments;
    }
  }

  onSelectAppointments(id: number) {
    this.times = [];
    if (id) {
      this.times = this.appointments.filter((e) => e.id == id)[0].times;
    }
  }

  copyMessage(Input: HTMLInputElement) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = Input.value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._MessageService.add({
      severity: 'success',
      summary: 'Notification ',
      detail: 'Copied to clipboard!',
    });
  }
}
