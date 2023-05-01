import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-show-lead',
  templateUrl: './show-lead.component.html',
  styleUrls: ['./show-lead.component.scss'],
})
export class ShowLeadComponent implements OnInit {
  constructor(private _SurveyService: SurveyService, private _Router: Router) {}

  leads: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this.getLeads();
  }

  getLeads(page: number = 1) {
    if (this.appliedFilters) {
      this.filter(...this.appliedFilters);
    } else {
      this._SurveyService.getLeads(page).subscribe({
        next: (res) => {
          this.leads = res?.data?.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  showRow(id: number) {
    if (id) {
      this._SurveyService.leadId.next(id);
      this._Router.navigate(['leads/details']);
    }
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getLeads(e.first / e.rows + 1);
  }

  // *******************************
  questions: any[] = [];
  getAllQuestions() {
    this._SurveyService.getQuestions().subscribe({
      next: (res) => {
        this.questions = res.data;
      },
    });
  }
  filterModal: boolean = false;
  appliedFilters: any = null;
  rangeDates: any;
  filter(
    filter1?: any,
    filter2?: any,
    filter3?: any,
    filter4?: any,
    filter5?: any,
    filter6?: any,
    filter7?: any
  ) {
    filter3.value == undefined && (filter3.value = []);
    let FILTER: any = {
      lead_question_id: filter1.value || null,
      assigned_id: filter2.value || null,
      date:
        filter3?.value[0] && !filter3?.value[1]
          ? new Date(filter3?.value[0]).toLocaleDateString()
          : null,
      from: filter3?.value[1]
        ? new Date(filter3?.value[0]).toLocaleDateString()
        : null,
      to: filter3?.value[1]
        ? new Date(filter3?.value[1]).toLocaleDateString()
        : null,
      customer_name: filter4.value || null,
      customer_mobile: filter5.value || null,
      customer_email: filter6.value || null,
      lead_answer_id: filter7.value || null,
    };

    this.appliedFilters = [
      filter1,
      filter2,
      filter3,
      filter4,
      filter5,
      filter6,
      filter7,
    ];
    Object.keys(FILTER).forEach((k) => FILTER[k] == null && delete FILTER[k]);
    this._SurveyService.filterLeads(FILTER).subscribe((res) => {
      this.leads = res.data.data;
      this.PaginationInfo = res.data;
    });
  }

  resetFilter(
    filter1: any,
    filter2: any,
    filter3: any,
    filter4: any,
    filter5: any,
    filter6: any,
    filter7: any
  ) {
    this.filterModal = false;
    filter1.value = null;
    filter2.value = null;
    filter3.value = undefined;
    filter4.value = null;
    filter5.value = null;
    filter6.value = null;
    filter7.value = null;
    this.rangeDates = null;
    this.getLeads();
    this.getAgents();
    this.appliedFilters = null;
    this.answers = [];
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  answers: any[] = [];

  onSelectQuestion(e: any) {
    this.answers = [];
    let [currentQuestion] = this.questions.filter(f=>f.id == e.value)
    this.answers = currentQuestion?.answers
  }
}
