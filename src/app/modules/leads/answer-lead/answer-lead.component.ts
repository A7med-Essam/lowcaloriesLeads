import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Calendar } from 'primeng/calendar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { SurveyService } from 'src/app/services/survey.service';
import { MessageService } from 'primeng/api';
import { GuardService } from 'src/app/services/guard.service';

@Component({
  selector: 'app-answer-lead',
  templateUrl: './answer-lead.component.html',
  styleUrls: ['./answer-lead.component.scss'],
})
export class AnswerLeadComponent implements OnInit, OnDestroy {
  isSuperAdmin: boolean = false;
  lead_id: number = 0;
  constructor(
    private _SurveyService: SurveyService,
    private _Router: Router,
    private _FormBuilder: FormBuilder,
    private _MessageService: MessageService,
    private _AuthService: AuthService,
    private _GuardService: GuardService
  ) {
    _AuthService.currentUser
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data != null) {
          data.role_name == 'super_admin'
            ? (this.isSuperAdmin = true)
            : (this.isSuperAdmin = false);
        } else {
          this.isSuperAdmin = false;
        }
      });
  }
  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this._SurveyService.leadId.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (res) => {
        if (res == 0) {
          this._Router.navigate(['leads/show']);
        } else {
          this.getPermission();
          this.getLeadDetails(res);
          this.getAgents();
          this.setAdminForm();
          this.lead_id = res;
        }
      },
    });
  }

  assignPermission: boolean = false;
  replayPermission: boolean = false;
  // updatePermission: boolean = false;

  getPermission() {
    this.assignPermission =
      this._GuardService.getPermissionStatus('assign_leads');
    this.replayPermission =
      this._GuardService.getPermissionStatus('replay_leads');
    // this.updatePermission =
    //   this._GuardService.getPermissionStatus('update_leads');
  }

  lead: any;
  getLeadDetails(id: number) {
    this._SurveyService.showLead(id).subscribe({
      next: (res) => {
        this.lead = res.data;
        this.lead.inputs = this.removeDuplicates();
      },
    });
  }

  removeDuplicates() {
    const combinedArr: any[] = [];
    const groupedObj: any = {};
    this.lead.inputs.forEach((obj: any) => {
      const leadQuestionId = obj.lead_question_id;
      if (!groupedObj[leadQuestionId]) {
        groupedObj[leadQuestionId] = obj;
        combinedArr.push(obj);
      } else {
        const existingObj = groupedObj[leadQuestionId];
        if (!Array.isArray(existingObj)) {
          groupedObj[leadQuestionId] = [existingObj];
        }
        groupedObj[leadQuestionId].push(obj);
        existingObj.answer = groupedObj[leadQuestionId].map(
          (item: any) => item.answer
        );
      }
    });
    return combinedArr;
  }

  backDetailsBtn() {
    this._Router.navigate(['leads/show']);
  }

  displayUpdate(lead: any) {
    // if (this.updatePermission) {
    //   this._SurveyService.currentUpdatedLead.next(lead);
    //   this._Router.navigate(['leads/update']);
    // }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  allReplies: any[] = [];
  noReplayMsg: string = '';
  getAllReplies(id: number) {
    this._SurveyService.getAllReplies(id).subscribe({
      next: (res) => {
        this.allReplies = res.data;
        res.data.length == 0 && (this.noReplayMsg = 'There is no replies');
      },
    });
  }

  displayAssignedUsersModal(leadId: number) {
    if (this.assignPermission) {
      this.getAssignedUsers();
      this.currentLeadId = leadId;
      this.assignModal = true;
    }
  }

  addReplayModal: boolean = false;
  allRepliesModal: boolean = false;
  assignModal: boolean = false;

  addReplay(txt: string) {
    let replay = {
      replay: txt,
      lead_id: this.currentLeadId,
      user_id: this._AuthService?.currentUser?.value?.id,
    };
    this._SurveyService.addReplay(replay).subscribe({
      next: (res) => {
        this.addReplayModal = false;
      },
    });
  }

  currentLeadId: number = 0;
  displayReplayModal(leadId: number) {
    if (this.replayPermission) {
      this.currentLeadId = leadId;
      this.addReplayModal = true;
    }
  }

  displayAllRepliesModal(leadId: number) {
    this.currentLeadId = leadId;
    this.allRepliesModal = true;
    this.getAllReplies(leadId);
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data;
      },
    });
  }

  assignUsers(users: FormGroup) {
    this._SurveyService
      .assignLead({
        lead_id: this.currentLeadId,
        user_ids: users.value.user_ids.filter(Number),
      })
      .subscribe({
        next: (res) => {
          this.assignModal = false;
          this.lead.lead_users = res.data.lead_users;
        },
      });
  }
  AssignForm: FormGroup = new FormGroup({});
  setAdminForm() {
    this.AssignForm = this._FormBuilder.group({
      user_ids: new FormArray([]),
    });
  }
  @ViewChild('AssignUsersForm') AssignUsersForm!: HTMLFormElement;

  getAssignedUsers() {
    this.resetAssignForm();
    const usersId =
      this.AssignUsersForm.nativeElement.querySelectorAll('input');
    const leadUsers = this.lead.lead_users;
    const formArray: FormArray = this.AssignForm.get('user_ids') as FormArray;
    if (leadUsers) {
      this.assignModal = true;
      for (let i = 0; i < usersId.length; i++) {
        for (let j = 0; j < leadUsers.length; j++) {
          if (Number(usersId[i].value) == leadUsers[j].user_id) {
            if (!formArray.value.includes(leadUsers[j].user_id.toString())) {
              usersId[i].checked = true;
              formArray.push(new FormControl(usersId[i].value));
            }
          }
        }
      }
    }
  }

  resetAssignForm() {
    this.AssignForm.reset();
    this.AssignUsersForm.nativeElement
      .querySelectorAll('input')
      .forEach((u: any) => (u.checked = false));
  }

  onCheckChange(event: any, status: string = 'edit') {
    const formArray: FormArray = this.AssignForm.get('user_ids') as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    } else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: any) => {
        if (ctrl.value == event.target.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  // ====================================================
  addReminder: boolean = false;
  minimumDate = new Date();
  reminderNotice: string = '';
  getReminderNotice(note: any) {
    this.reminderNotice = note.value;
    note.value = '';
  }

  addReminderLead(calendar: Calendar) {
    setTimeout(() => {
      if (calendar.inputFieldValue != '') {
        const lead = {
          remind_data: this.reminderNotice,
          lead_id: this.lead.id,
          remind_date: new Date(calendar.inputFieldValue).toLocaleDateString(
            'en-CA'
          ),
          reminded: false,
          add: true,
        };
        this._SurveyService.addReminderLead(lead).subscribe({
          next: (res) => {
            if (res.status == 1) {
              this.addReminder = false;
              this.addReplayModal = false;
              calendar.clear();
            }
          },
          error: (err) => {
            for (const [key, value] of Object.entries(err.error.errors)) {
              const x: any = value;
              this._MessageService.add({
                severity: 'warn',
                summary: 'Notification',
                detail: x[0],
              });
            }
          },
        });
      }
    }, 1);
  }
}
