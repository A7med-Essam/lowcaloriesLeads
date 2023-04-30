import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SurveyService } from 'src/services/survey.service';

@Component({
  selector: 'app-create-lead-questions',
  templateUrl: './create-lead-questions.component.html',
  styleUrls: ['./create-lead-questions.component.scss']
})
export class CreateLeadQuestionsComponent implements OnInit {

  questions: any[] = [];
  questionsClone: any[] = [];
  selectedValues: any;
  selectedDropDownValues: any;
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _MessageService: MessageService
  ) {}
  @Input() lead_id:number = 0

  ngOnInit() {
    this.getSurvey();
  }

  getSurvey() {
    this._SurveyService.getCreateLeadsInfo().subscribe({
      next: (res) => {
        this.questions = res.data;
        this.questionsClone = res.data;
      },
    });
  }

  setRadioAnswer(answerId: number, questionId: number, suggest_answer: string) {
    this.questions.filter((a: any) => a.id == questionId)[0].userAnswer = {
      survey_question_id: questionId,
      survey_answer_id: answerId,
      suggest_answer: suggest_answer,
    };
    this.checkValidation()
  }

  setCheckAnswer() {
    let output: any[] = [];
    this.selectedValues.forEach(function (item: any) {
      let existing = output.filter(function (v, i) {
        return v.questionId == item.questionId;
      });
      if (existing.length) {
        let existingIndex = output.indexOf(existing[0]);
        output[existingIndex].answerId = output[existingIndex].answerId.concat(
          item.answerId
        );
      } else {
        if (typeof item.answerId == 'number') item.answerId = [item.answerId];
        output.push(item);
      }
    });
    output.forEach((e) => {
      e.answerId = [...new Set(e.answerId)];
    });

    output.forEach((obj: any) => {
      this.questions.filter((a: any) => a.id == obj.questionId)[0].userAnswer =
        {
          survey_question_id: obj.questionId,
          survey_answer_id: obj.answerId,
          suggest_answer: '',
        };
    });

    this.questions.forEach((element) => {
      if ('userAnswer' in element && element.type == 'check') {
        if (
          this.selectedValues.filter(
            (e: any) => e.questionId == element.userAnswer.survey_question_id
          ).length == 0
        ) {
          delete element.userAnswer;
        }
      }
    });
    this.checkValidation()
  }

  setTextAnswer(surveyTextInput: HTMLInputElement, survey: any) {
    this.questions.filter((a: any) => a.id == survey.id)[0].userAnswer = {
      survey_question_id: survey.id,
      survey_answer_id: '',
      suggest_answer: surveyTextInput.value,
    };
    if (surveyTextInput.value == '') {
      delete this.questions.filter((a: any) => a.id == survey.id)[0].userAnswer;
    }
    this.checkValidation()
  }

  setDropdownAnswer(
    answerId: number,
    questionId: number,
    suggest_answer: string
  ) {
    this.questions.filter((a: any) => a.id == questionId)[0].userAnswer = {
      survey_question_id: questionId,
      survey_answer_id: answerId,
      suggest_answer: suggest_answer,
    };
    this.checkValidation()
  }

  createLead() {
    this.createButtonState = false;
    this.questions = this.questions.filter(e=> e.userAnswer != null)

    let lead: any = {
      inputs: [],
      lead_id:this.lead_id
    };

    this.questions.forEach((q) => {
      lead.inputs.push({
        lead_question_id: q.userAnswer?.survey_question_id,
        lead_answer_id: q.userAnswer?.survey_answer_id,
        suggest_answer: q.userAnswer?.suggest_answer,
      });
    });

    lead.inputs.forEach((e: any) => {
      if ( typeof(e.lead_answer_id) == "object") {
        if (e.lead_answer_id.length == 1) {
          e.lead_answer_id = e.lead_answer_id[0]
        }
      }
    });

    this._SurveyService.createLeadDetails(lead).subscribe({
      next: (res) => {
        this.questions = [];
        setTimeout(() => {
          this.questions = this.questionsClone
        }, 1);
        this._MessageService.add({
          severity: 'success',
          summary: 'Notification',
          detail: res.message,
        });
        this._Router.navigate(['./leads/show'])
      },
      error: err=>{
        this.questions = this.questionsClone
        this._MessageService.add({
          severity: 'error',
          summary: 'Notification',
          detail: err.message,
        });
      }
    });
  }

  createButtonState:boolean = false;
  checkValidation(){
    this.createButtonState = this.questions.some(a => a.userAnswer)
  }

}
