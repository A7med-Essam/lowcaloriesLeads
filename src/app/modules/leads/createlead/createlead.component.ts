import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { GuardService } from 'src/app/services/guard.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-createlead',
  templateUrl: './createlead.component.html',
  styleUrls: ['./createlead.component.scss'],
})
export class CreateleadComponent implements OnInit, OnDestroy {
  agents: any[] = [];
  platforms: any[] = [];
  interval: any;
  createForm!: FormGroup;

  constructor(
    private _SurveyService: SurveyService,
    private _MessageService: MessageService,
    private _FormBuilder: FormBuilder,
    private _GuardService:GuardService
  ) {}

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  ngOnInit() {
    this.createLeadForm();
    this.getPlatforms();
    this.checkAgent();
    setTimeout(() => {
      this.getAgents();
    }, 500);
    this.interval = setInterval(() => {
      this.getAgents();
    }, 10000);
  }

  checkAgent(){
    if (this._GuardService.getUser().role_name.toLowerCase() == 'agent') {
      this.createForm.get('user_ids')?.clearValidators();
      this.createForm.get('user_ids')?.disable();
      this.createForm.patchValue({
        user_ids: [this._GuardService.getUser().id]
      });
    }
  }

  fixMultieSelectFilter(e: any) {
    if (e.filterValue == 'Online') {
      e.filterValue = 'Online';
    }
  }

  creatingStatus:boolean = false;
  createLead(form: FormGroup) {
    if (form.valid) {
      this.creatingStatus = true;
      this._SurveyService.createLead(form.getRawValue()).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.creatingStatus = false;
            form.reset();
            this.checkAgent();
            this._MessageService.add({
              severity: 'success',
              summary: 'Notification',
              detail: res.message,
            });
          }
        },
      });
    }
  }

  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        res.data.forEach((e: any) => {
          if (e.status == 'Online') {
            e.name = `${e.name} - Online 🟢`;
          } else {
            e.name = `${e.name} - Offline 🔴`;
          }
        });
        this.agents = res.data;
      },
    });
  }

  getPlatforms() {
    this._SurveyService.getPlatforms().subscribe({
      next: (res) => {
        this.platforms = res.data;
      },
    });
  }

  createLeadForm() {
    this.createForm = this._FormBuilder.group({
      notes: new FormControl(null),
      customer_name: new FormControl(null),
      customer_email: new FormControl(null),
      customer_mobile: new FormControl(null, [Validators.required]),
      user_ids: new FormControl(null, [Validators.required]),
      platforms: new FormControl(null, [Validators.required]),
    });
  }
}
