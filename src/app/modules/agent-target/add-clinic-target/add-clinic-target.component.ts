import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-add-clinic-target',
  templateUrl: './add-clinic-target.component.html',
  styleUrls: ['./add-clinic-target.component.scss'],
})
export class AddClinicTargetComponent implements OnInit {
  insertForm!: FormGroup;
  constructor(
    private _DislikeService: DislikeService,
    private _Router: Router,
    private _AgentTargetService: AgentTargetService,
    private _MessageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getInsertForm();
    this.getAgentBranches();
    this.getTargetOptions();
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        date: new Date(form.value.date).toLocaleDateString('en-CA'),
      });
      this._AgentTargetService.addTarget(form.value).subscribe((res) => {
        if (res.status) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Target',
            detail: 'Target Added Successfully',
          });
          this.insertForm.reset({ type: 'Clinic' });
        }
      });
    }
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      client_number: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[\\d]{10}$'),
      ]),
      client_cid: new FormControl(null),
      // branch: new FormControl(null),
      // customer_type: new FormControl(null),
      // status: new FormControl(null),
      invoice_number: new FormControl(null),
      amount_paid: new FormControl(null),
      // team: new FormControl(null),
      paid_by: new FormControl(null, [Validators.required]),
      type: new FormControl('Clinic', [Validators.required]),
      date: new FormControl(null, [Validators.required]),
      client_name: new FormControl(null),
    });
  }

  // ================================== OPTIONS =========================================

  paid_by: any[] = [];
  teams: any[] = [];
  customer_types: any[] = [];
  status: any[] = [];
  branches: any[] = [];

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  getTargetOptions() {
    this._AgentTargetService.getTargetOptions().subscribe({
      next: (res) => {
        this.customer_types = res.data.customer_types;
        this.paid_by = res.data.payment_types;
        this.teams = res.data.teams;
        this.status = res.data.status;
      },
    });
  }

  // ================================== Client number & cid =========================================

  goBack(): void {
    this._Router.navigate(['target']);
  }
}
