import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-create-lead-questions',
  templateUrl: './create-lead-questions.component.html',
  styleUrls: ['./create-lead-questions.component.scss'],
})
export class CreateLeadQuestionsComponent implements OnInit {
  // @Input() lead_id: number = 0;
  // questions: any[] = [];
  // questionsClone: any[] = [];
  // selectedValues: any;
  // items: MenuItem[] = [];
  // activeIndex: number = 0;
  // maxIndex:number = 0;
  // stepSize:number = 0
  // createButtonState: boolean = false;

  // constructor(
  // private _SurveyService: SurveyService,
  // private _Router: Router,
  // private _MessageService: MessageService
  // ) {}

  // ngOnInit() {
  //   this.getSurvey();
  // }

  // getSurvey() {
  //   this._SurveyService.getCreateLeadsInfo().subscribe({
  //     next: (res) => {
  //       this.questions = res.data;
  //       this.questionsClone = res.data;
        // this.stepSize = 5;
        // let stepCount = Math.ceil(this.questions.length / this.stepSize);
        // let steps:MenuItem[] = []
        // for (let i = 0; i < stepCount; i++) {
        //   let stepLabel = "Step " + (i + 1);
        //   this.maxIndex = i;
        //   steps.push({ label: stepLabel , target:this.stepSize.toString()});
        // }
        // this.items = steps
  //     },
  //   });
  // }

  // setRadioAnswer(answerId: number, questionId: number, suggest_answer: string) {
    // this.questions.filter((a: any) => a.id == questionId)[0].userAnswer = {
    //   survey_question_id: questionId,
    //   survey_answer_id: answerId,
    //   suggest_answer: suggest_answer,
    // };
  //   this.checkValidation();
  // }

  // setDateAnswer(date: Date, questionId: number) {
  //   this.questions.filter((a: any) => a.id == questionId)[0].userAnswer = {
  //     survey_question_id: questionId,
  //     survey_answer_id: '',
  //     suggest_answer: date.toLocaleDateString('en-CA'),
  //   };
  //   this.checkValidation();
  // }

  // setCheckAnswer() {
  //   let output: any[] = [];
  //   this.selectedValues.forEach(function (item: any) {
  //     let existing = output.filter(function (v, i) {
  //       return v.questionId == item.questionId;
  //     });
  //     if (existing.length) {
  //       let existingIndex = output.indexOf(existing[0]);
  //       output[existingIndex].answerId = output[existingIndex].answerId.concat(
  //         item.answerId
  //       );
  //     } else {
  //       if (typeof item.answerId == 'number') item.answerId = [item.answerId];
  //       output.push(item);
  //     }
  //   });
  //   output.forEach((e) => {
  //     e.answerId = [...new Set(e.answerId)];
  //   });

  //   output.forEach((obj: any) => {
  //     this.questions.filter((a: any) => a.id == obj.questionId)[0].userAnswer =
  //       {
  //         survey_question_id: obj.questionId,
  //         survey_answer_id: obj.answerId,
  //         suggest_answer: '',
  //       };
  //   });

  //   this.questions.forEach((element) => {
  //     if ('userAnswer' in element && element.type == 'check') {
  //       if (
  //         this.selectedValues.filter(
  //           (e: any) => e.questionId == element.userAnswer.survey_question_id
  //         ).length == 0
  //       ) {
  //         delete element.userAnswer;
  //       }
  //     }
  //   });
  //   this.checkValidation();
  // }

  // setTextAnswer(surveyTextInput: HTMLInputElement, survey: any) {
  //   this.questions.filter((a: any) => a.id == survey.id)[0].userAnswer = {
  //     survey_question_id: survey.id,
  //     survey_answer_id: '',
  //     suggest_answer: surveyTextInput.value,
  //   };
  //   if (surveyTextInput.value == '') {
  //     delete this.questions.filter((a: any) => a.id == survey.id)[0].userAnswer;
  //   }
  //   this.checkValidation();
  // }

  // setDropdownAnswer(
  //   answerId: number,
  //   questionId: number,
  //   suggest_answer: string
  // ) {
  //   this.questions.filter((a: any) => a.id == questionId)[0].userAnswer = {
  //     survey_question_id: questionId,
  //     survey_answer_id: answerId,
  //     suggest_answer: suggest_answer,
  //   };
  //   this.checkValidation();
  // }

  // createLead() {
  //   this.createButtonState = false;
  //   this.questions = this.questions.filter((e) => e.userAnswer != null);

  //   let lead: any = {
  //     inputs: [],
  //     lead_id: this.lead_id,
  //   };

  //   this.questions.forEach((q) => {
  //     lead.inputs.push({
  //       lead_question_id: q.userAnswer?.survey_question_id,
  //       lead_answer_id: q.userAnswer?.survey_answer_id,
  //       suggest_answer: q.userAnswer?.suggest_answer,
  //     });
  //   });

  //   lead.inputs.forEach((e: any) => {
  //     if (typeof e.lead_answer_id == 'object') {
  //       if (e.lead_answer_id.length == 1) {
  //         e.lead_answer_id = e.lead_answer_id[0];
  //       }
  //     }
  //   });

  //   this._SurveyService.createLeadDetails(lead).subscribe({
  //     next: (res) => {
  //       this.questions = [];
  //       setTimeout(() => {
  //         this.questions = this.questionsClone;
  //       }, 1);
  //       this._MessageService.add({
  //         severity: 'success',
  //         summary: 'Notification',
  //         detail: res.message,
  //       });
  //       this._Router.navigate(['./leads/show']);
  //     },
  //     error: (err) => {
  //       this.questions = this.questionsClone;
  //       this._MessageService.add({
  //         severity: 'error',
  //         summary: 'Notification',
  //         detail: err.message,
  //       });
  //     },
  //   });
  // }

  // checkValidation() {
  //   this.questions.forEach(e => {
  //     if (e.required == "yes" && e.userAnswer) {
  //       this.createButtonState = true;
  //     }
  //   });
  //   this.questions.forEach(e => {
  //     if (e.required == "yes" && !e.userAnswer) {
  //       this.createButtonState = false;
  //     }
  //   });
  // }

  // changeIndex(status:boolean){
  //   if (status) {
  //     this.activeIndex++
  //   } else {
  //     this.activeIndex--
  //   }
  // }

  // =================================================================Dynamic Form=======================================================================
  @Input() lead_id: number = 0;
  questions: any[] = [];
  form: FormGroup;
  loadingQuestions: boolean = true;
  items: MenuItem[] = [];
  activeIndex: number = 0;
  maxIndex:number = 0;
  stepSize:number = 0


  constructor(
    private formBuilder: FormBuilder,
    private _SurveyService: SurveyService,
    private _MessageService: MessageService,
    private _Router: Router
  ) {
    this.form = this.formBuilder.group({
      items: this.formBuilder.array([]),
    });
  }

  ngOnInit() {
    this.getSurvey();
    this.form = new FormGroup({});
  }

  getSurvey() {
    this._SurveyService.getCreateLeadsInfo().subscribe((res) => {
      this.questions = res.data;
      this.initForm();
      this.loadingQuestions = false;
      this.stepSize = 5;
      let stepCount = Math.ceil(this.questions.length / this.stepSize);
      let steps:MenuItem[] = []
      for (let i = 0; i < stepCount; i++) {
        let stepLabel = "Step " + (i + 1);
        this.maxIndex = i;
        steps.push({ label: stepLabel , target:this.stepSize.toString()});
      }
      this.items = steps
    });
  }

  initForm() {
    for (const question of this.questions) {
      const validators =
        question.required == 'yes' ? [Validators.required] : [];
      this.form.addControl(question.id, new FormControl(null, validators));
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.addUserAnswer()
      this.questions = this.questions.filter((e) => e.userAnswer != null);
      let lead: any = { inputs: [], lead_id: this.lead_id };
      this.questions.forEach((q) => {
        lead.inputs.push({
          lead_question_id: q.userAnswer?.lead_question_id,
          lead_answer_id: q.userAnswer?.lead_answer_id,
          suggest_answer: q.userAnswer?.suggest_answer,
        });
      });
      lead.inputs.forEach((e: any) => {
        if (typeof e.lead_answer_id == 'object') {
          if (e.lead_answer_id.length == 1) {
            e.lead_answer_id = e.lead_answer_id[0];
          }
        }
      });

      this.createLead(lead);
    }
  }

  updateCheckboxValue(questionId: number, elm: Checkbox) {
    const formControl = this.form.get(questionId.toString());
    const currentValues: number[] = formControl?.value || [];
    if (currentValues.includes(elm.value)) {
      formControl?.setValue([...currentValues, elm.value]);
    } else {
      const uniqueArray = currentValues.filter((value: number) => {
        return value != elm.value;
      });
      formControl?.setValue(uniqueArray);
    }
    const uniqueArray2 = [...new Set(formControl?.value)];
    formControl?.setValue(uniqueArray2);
  }

  createLead(lead: any) {
    this._SurveyService.createLeadDetails(lead).subscribe({
      next: (res) => {
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Notification',
            detail: res.message,
          });
          this._Router.navigate(['./leads/show']);
        }
      },
      error: (err) => {
        this._MessageService.add({
          severity: 'error',
          summary: 'Notification',
          detail: err.message,
        });
      },
    });
  }

  getInputsValues():{lead_question_id:number,lead_answer_id:number,suggest_answer:string}[]{
    const keys:any = Object.keys(this.form.controls);
    this.questions.filter((a: any) => a.id == keys[0])[0].userAnswer = {
      survey_question_id: keys[0],
      survey_answer_id: keys[0].value,
      suggest_answer: keys[0] == this.questions.find(e=>e.tpye == 'text').id ? keys[0].value:'',
    };

    console.log(this.questions);

    return [
      {
        lead_question_id:1,
        lead_answer_id:1,
        suggest_answer:''
      }
    ]
  }

  addUserAnswer() {
    const keys: any[] = Object.keys(this.form.controls);
    keys.forEach(key => {
      const questionId = parseInt(key);
      const question = this.questions.find(q => q.id === questionId);
      if (question) {
        const answerId = this.form.controls[key].value;
        const isText = question.type === 'text' ;
        const isDate = question.type === 'date';
        question.userAnswer = {
          lead_question_id: questionId,
          lead_answer_id: (isText||isDate) ? '' : answerId,
          suggest_answer: (isText||isDate) ? (isDate? new Date(answerId).toLocaleDateString('en-CA'):answerId) : ''
        };
      }
    });
  }
  
  changeIndex(status:boolean){
    if (status) {
      this.activeIndex++
    } else {
      this.activeIndex--
    }
  }
}
