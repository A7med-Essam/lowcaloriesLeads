import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';
import { SurveyService } from 'src/app/services/survey.service';

@Component({
  selector: 'app-create-complaints',
  templateUrl: './create-complaints.component.html',
  styleUrls: ['./create-complaints.component.scss']
})
export class CreateComplaintsComponent implements OnInit  {
  insertForm!: FormGroup;
  constructor(
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _DislikeService: DislikeService,
    private _LocalService: LocalService,
    private _ComplaintsService: ComplaintsService,
  ) {}




  ngOnInit(): void {
    this.getInsertForm();
    this.getAgentBranches();
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        agent_id: this._LocalService.getJsonValue('userInfo_oldLowCalories').id,
      });
      this._ComplaintsService.addComplaints(form.value).subscribe((res) => {
        this._Router.navigate(['complaints/show'], {
          relativeTo: this._ActivatedRoute.parent?.parent,
        });
        this.insertForm.reset();
      });
    }
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      c_mobile: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[\\d]{10}$'),
      ]),
      c_name: new FormControl(null, [Validators.required]),
      cid: new FormControl(null, [Validators.required]),
      branch: new FormControl(null, [Validators.required]),
      issue_details: new FormControl(null, [Validators.required]),
      action: new FormControl(null, [Validators.required]),
      agent_id: new FormControl(null),
    });
  }

  // ================================== OPTIONS =========================================

  branches: any[] = [];

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

}
