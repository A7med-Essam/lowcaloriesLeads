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
  rangeDates: any;


  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      team: new FormControl(null),
      client_number: new FormControl(null),
      client_cid: new FormControl(null),
      emirate: new FormControl(null),
      branch: new FormControl(null),
      action: new FormControl(null),
      status: new FormControl(null),
      date: new FormControl(null),
      case: new FormControl(null),
      agent_id: new FormControl(null),
      notes: new FormControl(null),
    });
  }

  insertRow(form: FormGroup) {
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    if (form.value.date) {
      form.patchValue({
        date: new Date(form.value.date).toLocaleDateString('en-CA'),
      });
    }
    if (form.value.branch) {
      form.patchValue({
        branch: form.value.branch.name,
      });
    }

    this.appliedFilters = form.value;

    this._AgentTargetService.filterTargets(1, form.value).subscribe((res) => {
      this.targets = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
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
    this.targets();
  }

  resetFields(){
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

  // ****************************************************filter************************************************************************

  actions: any[] = [
    'Created Payment Link',
    'BANK TRANSFER',
    'Subscribe Via Branch',
    'Paid in Branch',
    'Subscribe Online',
  ];

  teams: any[] = ['WHATS APP TEAM', 'INSTEGRAM APP TEAM', 'FACEBOOK APP TEAM'];

  cases: any[] = ['RENEW', 'EXIST'];

  status: any[] = ['ACTIVE', 'PICKUP', 'NOT ACTIVE'];

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

  emirates: any[] = [
    {
      id: 26,
      name: 'Abu Dhabi',
    },
    {
      id: 27,
      name: 'Al-Gharbia',
    },
    {
      id: 28,
      name: 'Al-Ain',
    },
    {
      id: 29,
      name: 'Dubai',
    },
    {
      id: 30,
      name: 'Sharjah',
    },
    {
      id: 31,
      name: 'Ajman',
    },
    {
      id: 32,
      name: 'Ras Al-Khiema',
    },
    {
      id: 33,
      name: 'Umm Al-Quwain',
    },
    {
      id: 34,
      name: 'Fujirah',
    },
  ];
}
