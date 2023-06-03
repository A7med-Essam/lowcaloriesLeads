import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgentTargetService, ITarget } from 'src/app/services/agent-target.service';
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
     private _AgentTargetService:AgentTargetService
     ) {}

  targets: any;
  PaginationInfo: any;

  ngOnInit(): void {
    this.getTargets();
  }

  getTargets(page: number = 1) {
    if (this.appliedFilters) {
      this.filter(...this.appliedFilters);
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
    filter7?: any,
    filter8?: any,
    filter9?: any
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
      assigned: filter8.value || null,
      replied: filter9.value || null,
    };

    this.appliedFilters = [
      filter1,
      filter2,
      filter3,
      filter4,
      filter5,
      filter6,
      filter7,
      filter8,
      filter9,
    ];
    Object.keys(FILTER).forEach((k) => FILTER[k] == null && delete FILTER[k]);
    this._SurveyService.filterLeads(FILTER).subscribe((res) => {
      this.targets = res.data.data;
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
    filter7: any,
    filter8: any,
    filter9: any
  ) {
    this.filterModal = false;
    filter1.value = null;
    filter2.value = null;
    filter3.value = undefined;
    filter4.value = null;
    filter5.value = null;
    filter6.value = null;
    filter7.value = null;
    filter8.value = null;
    filter9.value = null;
    this.rangeDates = null;
    this.getTargets();
    this.getAgents();
    this.appliedFilters = null;
    this.answers = [];
    this.resetStaticFilterOptions();
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
    let [currentQuestion] = this.questions.filter((f) => f.id == e.value);
    this.answers = currentQuestion?.answers;
  }

  assigned: any = [
    { name: 'Assigned', value: 'true' },
    { name: 'Not Assigned', value: 'false' },
  ];

  replied: any = [
    { name: 'Replied', value: 'true' },
    { name: 'Not Replied', value: 'false' },
  ];

  resetStaticFilterOptions() {
    this.assigned = [
      { name: 'Assigned', value: 'true' },
      { name: 'Not Assigned', value: 'false' },
    ];

    this.replied = [
      { name: 'Replied', value: 'true' },
      { name: 'Not Replied', value: 'false' },
    ];
  }
  resetFields(
    filter1: any,
    filter2: any,
    filter3: any,
    filter4: any,
    filter5: any,
    filter6: any,
    filter7: any,
    filter8: any,
    filter9: any
  ) {
    filter1.value = null;
    filter2.value = null;
    filter3.value = undefined;
    filter4.value = null;
    filter5.value = null;
    filter6.value = null;
    filter7.value = null;
    filter8.value = null;
    filter9.value = null;
    this.rangeDates = null;
    this.getAgents();
    this.getAllQuestions();
    this.appliedFilters = null;
    this.answers = [];
    this.resetStaticFilterOptions();
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

}
