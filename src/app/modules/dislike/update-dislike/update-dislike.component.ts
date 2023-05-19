import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-update-dislike',
  templateUrl: './update-dislike.component.html',
  styleUrls: ['./update-dislike.component.scss'],
})
export class UpdateDislikeComponent implements OnInit {
  updateForm!: FormGroup;

  constructor(
    private _Router: Router,
    private _DislikeService: DislikeService,
    private _MessageService: MessageService,
    private _LocalService: LocalService
  ) {}

  ngOnInit(): void {
    this.setUpdateForm();
    this.getAgentBranches();
    this.showDetails();
    this.getMeals();
  }

  update() {
    this._DislikeService
      .updateDislikes(this.updateForm.value)
      .subscribe((res) => {
        this._MessageService.add({
          severity: 'success',
          summary: 'Notification',
          detail: res.message,
        });
        this._Router.navigate(['dislike/show']);
      });
  }

  showDetails() {
    this._DislikeService.dislikeDetails.subscribe((dislike) => {
      if (dislike) {
        this.setUpdateForm(dislike);
      } else {
        this._Router.navigate(['dislike/show']);
      }
    });
  }

  setUpdateForm(data?: any) {
    this.updateForm = new FormGroup({
      dislike_request_id: new FormControl(data?.id, [Validators.required]),
      name: new FormControl(data?.name, [Validators.required]),
      cid: new FormControl(data?.cid, [Validators.required]),
      email: new FormControl(data?.email, [Validators.required]),
      branch: new FormControl(data?.branch, [Validators.required]),
      sent_by: new FormControl(data?.sent_by, [Validators.required]),
      agent_id: new FormControl(
        this._LocalService.getJsonValue('userInfo_oldLowCalories').id,
        [Validators.required]
      ),
      dislike_meals: new FormControl(data?.dislike_meals, [
        Validators.required,
      ]),
      mobile: new FormControl(data?.mobile, [Validators.required]),
      reasons: new FormControl(data?.reasons, [Validators.required]),
    });
  }

  branches: any[] = [];
  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  meals: any[] = [];
  getMeals() {
    this._DislikeService.getMeals().subscribe({
      next: (res) => (this.meals = res.data),
    });
  }
}
