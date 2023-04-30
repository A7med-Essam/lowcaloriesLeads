import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { SurveyService } from 'src/services/survey.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
  providers: [ConfirmationService],
})
export class SurveyComponent implements OnInit {
  uploadModal: boolean = false;
  filterModal: boolean = false;
  filterColumns: boolean = false;
  selectedColumns: any[] = [];
  Survey: any[] = [];
  deleteConfirm: boolean = false;
  PaginationInfo: any;
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {}
  ngOnInit(): void {
    this.getSurveyQuestions();
    this.getAgents();
  }

  getSurveyQuestions(page: number = 1, paginate?: any) {
    // if (this.appliedFilters) {
    //   this.filter(...this.appliedFilters);
    // } else {
      this.currentPage > 1 ? (page = this.currentPage) : (page = 1);
      this._SurveyService
        .getSurveyQuestions(page, paginate)
        .subscribe((res) => {
          this.PaginationInfo = res.data;
          this.Survey = res.data.data;
        });
    // }
  }

  loadPatientListing(e: any) {}

  onFileSelected(event: any) {
    // const file: File = event.target.files[0];
    // if (file) {
    //   let f: File = this._AppService.getFormData({ file: file }) as any;
    //   this._SurveyService.uploadFile(f).subscribe({
    //     next: (res) => {
    //       this.uploadModal = false;
    //       this.getSurveyQuestions();
    //     },
    //   });
    //   this.uploadModal = false;
    // }
  }

  specificRows: number[] = [];
  getSpecificRows(input: HTMLInputElement) {
    if (input.checked) {
      this.specificRows.push(Number(input.value));
    } else {
      const index = this.specificRows.indexOf(Number(input.value));
      if (index > -1) {
        this.specificRows.splice(index, 1);
      }
    }
  }

  deleteSpecificRows() {
    if (this.specificRows.length > 0) {
      this._SurveyService
        .deleteSpecificRows({ ids: this.specificRows })
        .subscribe((res) => {
          this.getSurveyQuestions();
        });
    }
  }

  updateRow(id: number) {
    this._SurveyService.surveyQuestionsId.next(id);
    this._Router.navigate(['update-question'], {
      relativeTo: this._ActivatedRoute,
    });
  }

  insertAnswer(id: number) {
    this._SurveyService.surveyAnswers.next(id);
    this._Router.navigate(['insert-answer'], {
      relativeTo: this._ActivatedRoute,
    });
  }

  deleteRow(areaId: number) {
    this._SurveyService.deleteRow(areaId).subscribe((res) => {
      this.getSurveyQuestions();
    });
  }

  showRow(e: number) {
    this._SurveyService.surveyQuestionsId.next(e);
    this._Router.navigate(['details'], { relativeTo: this._ActivatedRoute });
  }

  confirm(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }

  confirm2() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteSpecificRows();
      },
    });
  }

  getSample() {
    this._SurveyService.getSample().subscribe((res) => {
      const link = document.createElement('a');
      link.href = res.data;
      link.click();
    });
  }

  currentPage: number = 1;
  paginate(e: any) {
    this.currentPage = e.first / e.rows + 1;
    this.getSurveyQuestions(e.first / e.rows + 1, e.rows);
  }

  // currentPage2: number = 1;
  // paginate2(e: any) {
  //   this.currentPage2 = e.first / e.rows + 1;
  //   const page = e.first / e.rows + 1;
  //   this.filter(this.filter_1, this.filter_2, this.filter_3, page, e.rows);
  // }

  update(e1: HTMLElement, e2: HTMLElement) {
    e1.classList.add('d-none');
    e2.classList.remove('d-none');
  }

  confirmUpdate(row: any, e1: HTMLElement, e2: HTMLInputElement, type: string) {
    e1.classList.remove('d-none');
    e2.classList.add('d-none');
    let updateData: any = {
      question_ar: row.question_ar,
      question: row.question,
      id: row.id,
      type: row.type,
    };
    updateData[type] = e2.value;
    this._SurveyService.updateRow(updateData).subscribe((res) => {
      this.getSurveyQuestions();
    });
  }

  columns: any[] = [
    { name: 'id', status: false },
    { name: 'question', status: true },
    { name: 'question_ar', status: true },
    { name: 'type', status: true },
    { name: 'answers_count', status: true },
  ];

  getFilterColumns() {
    this.columns.forEach((element) => {
      element.status = false;
    });

    this.selectedColumns.forEach((e) => {
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].name == e) {
          this.columns[i].status = true;
        }
      }
    });
  }

  selectAllColumns(checkboxContainer: HTMLElement, currentCheckbox: Checkbox) {
    setTimeout(() => {
      if (!currentCheckbox.checked()) {
        this.selectedColumns = [];
      } else {
        let checkboxes: HTMLLabelElement[] = [];
        this.selectedColumns = [];
        for (let i = 0; i < checkboxContainer.children.length; i++) {
          checkboxes.push(checkboxContainer.children[i].children[1] as any);
        }
        this.columns.forEach((e) => {
          this.selectedColumns.push(e.name);
        });
      }
    }, 1);
  }

  rangeDates: any;
  // answers: any[] = [];
  // PaginationInfo2: any;
  // surveyFilter: any[] = [];
  // filterStatus: boolean = false;
  // onSelectQuestion(e: any) {
  //   this.answers = [];
  //   this.answers = this.questions[e.value]?.answers;
  // }

  questions: any[] = [];
  getAllQuestions() {
    this._SurveyService.getQuestions().subscribe({
      next: (res) => {
        this.questions = res.data;
      },
    });
  }

  openFilter() {
    this.getAllQuestions();
  }

  // filter_1: any;
  // filter_2: any;
  // filter_3: any;
  // filter_4: any;
  // filter_5: any;
  // filter_6: any;
  appliedFilters: any = null;
  filter(
    filter1?: any,
    filter2?: any,
    filter3?: any,
    filter4?: any,
    filter5?: any,
    filter6?: any
  ) {
    // this.filter_1 = filter1;
    // this.filter_2 = filter2;
    // this.filter_3 = filter3;
    // this.filter_4 = filter4;
    // this.filter_5 = filter5;
    // this.filter_6 = filter6;
    filter3.value == undefined && (filter3.value = []);
    // if (filter3 == undefined ) {
    //   filter3 = []
    // }
    // else if(filter3.value == undefined){
    //   filter3.value = []
    // }
    const FILTER = {
      lead_question_id: filter1.value || '',
      assigned_id: filter2.value || '',
      date: !filter3?.value[1] ? filter3?.value[0] : '',
      from: filter3?.value[1] ? filter3?.value[0] : '',
      to: filter3?.value[1] ? filter3?.value[1] : '',
      customer_name: filter4.value,
      customer_mobile: filter5.value,
      customer_email: filter6.value,
    };
    this.appliedFilters = [
      filter1,
      filter2,
      filter3,
      filter4,
      filter5,
      filter6,
    ];
    this._SurveyService.getFilter(FILTER).subscribe((res) => {
      // this.filterStatus = true;
      // this.PaginationInfo2 = res.data;
      // this.surveyFilter = res.data.data;

      this.Survey = res.data;
    });
  }

  resetFilter(
    filter1: any,
    filter2: any,
    filter3: any,
    filter4: any,
    filter5: any,
    filter6: any
  ) {
    // this.filterStatus = false;
    this.filterModal = false;
    filter1.value = null;
    filter2.value = null;
    filter3.value = undefined;
    filter4.value = null;
    filter5.value = null;
    filter6.value = null;
    this.rangeDates = null;
    this.getSurveyQuestions();
    this.getAgents();
    this.appliedFilters = null;
  }

  showRowFiltered(e: number) {
    this._SurveyService.filterId.next(e);
    this._Router.navigate(['filter-details'], {
      relativeTo: this._ActivatedRoute,
    });
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }
}
