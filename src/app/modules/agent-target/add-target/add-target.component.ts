import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-add-target',
  templateUrl: './add-target.component.html',
  styleUrls: ['./add-target.component.scss'],
})
export class AddTargetComponent implements OnInit {
  insertForm!: FormGroup;
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _DislikeService: DislikeService,
    private _AgentTargetService:AgentTargetService
  ) {}

  ngOnInit(): void {
    this.getInsertForm();
    this.getAgentBranches();
    this.getAgents();
  }

  insertRow(form:FormGroup) {
    if (form.valid) {
      form.patchValue({
        // emirate: form.value.branch.agent_emirate_id,
        branch: form.value.branch.name,
        date: new Date(form.value.date).toLocaleDateString('en-CA'),
      });
      this._AgentTargetService.addTarget(form.value).subscribe((res) => {
        this._Router.navigate(['agent'], {
          relativeTo: this._ActivatedRoute.parent?.parent,
        });
      });
    }
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      team: new FormControl(null, [Validators.required]),
      client_number: new FormControl(null, [Validators.required]),
      client_cid: new FormControl(null, [Validators.required]),
      emirate: new FormControl(null, [Validators.required]),
      branch: new FormControl(null, [Validators.required]),
      action: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      date: new FormControl(null, [Validators.required]),
      case: new FormControl(null, [Validators.required]),
      agent_id: new FormControl(null, [Validators.required]),
      notes: new FormControl(null),
    });
  }

  // ================================== OPTIONS =========================================

  actions: any[] = [
    'Created Payment Link',
    'BANK TRANSFER',
    'Subscribe Via Branch',
    'Paid in Branch',
    'Subscribe Online'
  ];

  teams: any[] = [
    'WHATS APP TEAM',
    'INSTEGRAM APP TEAM',
    'FACEBOOK APP TEAM'
  ];

  cases: any[] = [
    'RENEW',
    'EXIST',
  ];

  status: any[] = [
    'ACTIVE',
    'PICKUP',
    'NOT ACTIVE'
  ];

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
  // ===============================================================

  emirates: any[] =[
    {
        "id": 26,
        "name": "Abu Dhabi",
    },
    {
        "id": 27,
        "name": "Al-Gharbia",
    },
    {
        "id": 28,
        "name": "Al-Ain",
    },
    {
        "id": 29,
        "name": "Dubai",
    },
    {
        "id": 30,
        "name": "Sharjah",
    },
    {
        "id": 31,
        "name": "Ajman",
    },
    {
        "id": 32,
        "name": "Ras Al-Khiema",
    },
    {
        "id": 33,
        "name": "Umm Al-Quwain",
    },
    {
        "id": 34,
        "name": "Fujirah",
    }
]
}
