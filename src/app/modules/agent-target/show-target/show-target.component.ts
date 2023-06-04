import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AgentTargetService,
  ITarget,
} from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-target',
  templateUrl: './show-target.component.html',
  styleUrls: ['./show-target.component.scss'],
})
export class ShowTargetComponent implements OnInit {
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _AgentTargetService: AgentTargetService,
    private _DislikeService: DislikeService
  ) {}

  targets: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this.getTargets();
    this.createFilterForm();
    this.getAgents();
    this.getAgentBranches();
    this.getTargetOptions();
  }

  getTargets(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters();
    } else {
      this._AgentTargetService.getTargets(page).subscribe({
        next: (res) => {
          this.targets = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(target: ITarget) {
    if (target) {
      this._AgentTargetService.target.next(target);
      this._Router.navigate(['agent/details']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getTargets(e.first / e.rows + 1);
  }

  // ****************************************************filter************************************************************************

  filterModal: boolean = false;
  appliedFilters: any = null;

  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      team: new FormControl(null),
      client_number: new FormControl(null),
      client_cid: new FormControl(null),
      branch: new FormControl(null),
      paid_by: new FormControl(null),
      status: new FormControl(null),
      date: new FormControl(null),
      customer_types: new FormControl(null),
      agent_id: new FormControl(null),
      invoice_number: new FormControl(null),
      type: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    if (form.value.branch) {
      form.patchValue({
        branch: form.value.branch.name,
      });
    }

    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
          date: null
        });
      } else {
        form.patchValue({
          date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
        });
      }
    }
    this.appliedFilters = form.value;
    this._AgentTargetService.filterTargets(1, form.value).subscribe((res) => {
      this.targets = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
      this.resetFields();
    });
  }

  getOldFilters() {
    this._AgentTargetService
      .filterTargets(1, this.appliedFilters)
      .subscribe((res) => {
        this.targets = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getTargets();
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ****************************************************export************************************************************************

  export() {
    this._AgentTargetService.exportTarget().subscribe({
      next: (res) => {
        const link = document.createElement('a');
        link.target = '_blank';
        link.href = res.data;
        link.click();
      },
    });
  }

  // ****************************************************filter options************************************************************************

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  branches: any[] = [];
  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  customer_types: any[] = [];
  types: any[] = [];
  paid_by: any[] = [];
  status: any[] = [];
  teams: any[] = [];
  getTargetOptions() {
    this._AgentTargetService.getTargetOptions().subscribe({
      next: (res) => {
        this.customer_types = res.data.customer_types;
        this.paid_by = res.data.payment_types;
        this.teams = res.data.teams;
        this.status = res.data.status;
        this.types = res.data.type;
      },
    });
  }
}
