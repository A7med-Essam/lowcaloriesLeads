import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';

@Component({
  selector: 'app-update-target',
  templateUrl: './update-target.component.html',
  styleUrls: ['./update-target.component.scss']
})
export class UpdateTargetComponent implements OnInit, OnDestroy {
  updateForm!: FormGroup;
  constructor(
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _DislikeService: DislikeService,
    private _AgentTargetService: AgentTargetService,
    private _MessageService: MessageService,
  ) {}

  goBack(): void {
    this._Router.navigate(['target'], {
      relativeTo: this._ActivatedRoute.parent?.parent,
    });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.createUpdateForm();
    this._AgentTargetService.currentUpdatedTarget
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (res) => {
        if (res == null) {
          this._Router.navigate(['target/show']);
        } else {
          this.getAgentBranches();
          this.getTargetOptions();
          this.patchForm(res)
        }
      },
    });

  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        date: new Date(form.value.date).toLocaleDateString('en-CA'),
      });
      this._AgentTargetService.updateTarget(form.value).subscribe((res) => {
        this._MessageService.add({
          severity: 'success',
          summary: 'Target',
          detail: 'Target Updated Successfully',
        });
        this.updateForm.reset();
        this._Router.navigate(['target'], {
          relativeTo: this._ActivatedRoute.parent?.parent,
        });
      });
    }
  }

  createUpdateForm() {
    this.updateForm = new FormGroup({
      client_number: new FormControl({ value: null }, [
        Validators.required,
        Validators.pattern('^[\\d]{10}$'),
      ]),
      customer_type: new FormControl({ value: null }, [Validators.required]),
      paid_by: new FormControl({ value: null }, [Validators.required]),
      invoice_number: new FormControl({ value: null }, [Validators.required]),
      type: new FormControl({ value: null }, [Validators.required]),
      date: new FormControl({ value: null }, [Validators.required]),
      team: new FormControl({ value: null }, [Validators.required]),
      amount_paid: new FormControl({ value: null }, [Validators.required]),
      client_name: new FormControl({ value: null }, [Validators.required]),
      target_id: new FormControl({ value: null }, [Validators.required]),
      client_cid: new FormControl({ value: null }, [Validators.required]),
      branch: new FormControl({ value: null }, [Validators.required]),
      status: new FormControl({ value: null }, [Validators.required]),
    });
  }

  patchForm(data:any){
    this.updateForm.patchValue({
      target_id: data.id,
      client_number: data.client_number,
      client_cid: data.client_cid,
      client_name: data.client_name,
      branch: data.branch,
      customer_type: data.customer_type,
      paid_by: data.paid_by,
      status: data.status,
      invoice_number: data.invoice_number,
      type: data.type,
      date: new Date(data.date),
      team: data.team,
      amount_paid: data.amount_paid,
    });
  }

  // ================================================================== OPTIONS ==============================================================
  paid_by: any[] = [];
  teams: any[] = [];
  customer_types: any[] = [];
  status: any[] = [];
  types: any[] = [];
  branches: any[] = [];

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  getTargetOptions() {
    this._AgentTargetService.getTargetOptions().subscribe({
      next: (res) => {
        this.customer_types  = res.data.customer_types;
        this.paid_by = res.data.payment_types;
        this.teams = res.data.teams;
        this.status = res.data.status;
        this.types = res.data.type;
      },
    });
  }
}