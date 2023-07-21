import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GuardService } from 'src/app/services/guard.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-lead',
  templateUrl: './show-lead.component.html',
  styleUrls: ['./show-lead.component.scss'],
})
export class ShowLeadComponent implements OnInit, OnDestroy {
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _GuardService: GuardService,
    private _MessageService:MessageService
  ) {}
  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  leads: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this._SurveyService.lead_filter
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(res=>{
      if (res) {
        this.appliedFilters = res
      }
    })
    this.getPermission();
    this.createFilterForm();
    this.getLeads();
  }

  exportPermission: boolean = false;
  answerPermission: boolean = false;
  createLeadsPermission: boolean = false;

  getPermission() {
    this.exportPermission =
      this._GuardService.getPermissionStatus('export_leads');
    this.answerPermission =
      this._GuardService.getPermissionStatus('answer_leads');
      this.createLeadsPermission =
      this._GuardService.getPermissionStatus('create_leads');
  }

  getLeads(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._SurveyService.getLeads(page).subscribe({
        next: (res) => {
          this.leads = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(lead: any) {
    if (lead) {
      this._SurveyService.lead.next(lead);
      this._Router.navigate(['leads/details']);
    }
  }

  answerLead(id: number) {
    if (id && this.answerPermission) {
      this._SurveyService.leadId.next(id);
      this._Router.navigate(['leads/answer']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getLeads(e.first / e.rows + 1);
  }

  // ********************************************************FILTER OPTIONS********************************************************************
  questions: any[] = [];
  answers: any[] = [];
  agents: any[] = [];
  assigned: any = [
    { name: 'Assigned', value: 'true' },
    { name: 'Not Assigned', value: 'false' },
  ];
  replied: any = [
    { name: 'Replied', value: 'true' },
    { name: 'Not Replied', value: 'false' },
  ];

  getAllQuestions() {
    this._SurveyService.getQuestions().subscribe({
      next: (res) => {
        this.questions = res.data;
      },
    });
  }

  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  onSelectQuestion(e: any) {
    this.answers = [];
    let [currentQuestion] = this.questions.filter((f) => f.id == e.value);
    this.answers = currentQuestion?.answers;
  }
// ===============================================================Export======================================================================
  export() {
    if (this.exportPermission) {
      const ids = this.leads.map((obj: any) => obj.id);
      this._SurveyService.exportLeads(ids).subscribe({
        next: (res) => {
          this._MessageService.add({
            severity: 'success',
            summary: 'Export Excel',
            detail: 'Leads Exported Successfully',
          });
          const link = document.createElement('a');
          link.target = '_blank';
          link.href = res.data;
          link.click();
        },
      });
    }
  }
// ===============================================================Filter======================================================================
  filterModal: boolean = false;
  appliedFilters: any = null;
  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      date: new FormControl(null),
      from: new FormControl(null),
      to: new FormControl(null),
      lead_question_id: new FormControl(null),
      assigned_id: new FormControl(null),
      customer_name: new FormControl(null),
      customer_mobile: new FormControl(null),
      customer_email: new FormControl(null),
      lead_answer_id: new FormControl(null),
      assigned: new FormControl(null),
      replied: new FormControl(null),
    });
  }

  applyFilter(form: FormGroup) {
    if (form.value.date) {
      if (form.value.date[1]) {
        form.patchValue({
          from: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
          to: new Date(form.value.date[1]).toLocaleDateString('en-CA'),
          date: null,
        });
      } else {
        form.patchValue({
          date: new Date(form.value.date[0]).toLocaleDateString('en-CA'),
        });
      }
    }
    for (const prop in form.value) {
      if (form.value[prop] === null) {
        delete form.value[prop];
      }
    }
    this.appliedFilters = form.value;
    this._SurveyService.lead_filter.next(this.appliedFilters)
    this._SurveyService.filterLeads(1, form.value).subscribe((res) => {
      this.leads = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
    });
  }

  getOldFilters(page:number) {
    this._SurveyService
      .filterLeads(page, this.appliedFilters)
      .subscribe((res) => {
        this.leads = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getLeads();
    this._SurveyService.lead_filter.next(null)
  }

  resetFields() {
    this.filterForm.reset();
  }
}
