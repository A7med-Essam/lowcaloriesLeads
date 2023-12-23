import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComplaintsService } from 'src/app/services/complaints.service';
import { DislikeService } from 'src/app/services/dislike.service';

@Component({
  selector: 'app-update-complaints',
  templateUrl: './update-complaints.component.html',
  styleUrls: ['./update-complaints.component.scss'],
})
export class UpdateComplaintsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  updateForm!: FormGroup;
  status :string[] = ["open","closed"]
  currentRow: any;

  constructor(
    private _ComplaintsService: ComplaintsService,
    private _MessageService: MessageService,
    private _Router: Router,
    private _DislikeService:DislikeService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.setForm();
    this._ComplaintsService.complaint
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['complaints/show']);
          } else {
            this.currentRow = res;
            this.getAgentBranches();
          }
        },
      });
  }

  // ================================== OPTIONS =========================================

  branches: any[] = [];

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => {
        this.branches = res.data
        this.patchForm();
      },
    });
  }

  setForm() {
    this.updateForm = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      issue_details: new FormControl(null, [Validators.required]),
      action: new FormControl(null, [Validators.required]),
      branch: new FormControl(null, [Validators.required]),
      reason: new FormControl('0'),
      status: new FormControl(null, [Validators.required]),
    });
  }

  patchForm() {
    this.updateForm.patchValue({
      id: this.currentRow.id,
      issue_details: this.currentRow.issue_details,
      action: this.currentRow.action,
      branch: this.currentRow.branch,
      status: this.currentRow.status,
    });
  }

  update(form: FormGroup) {
    if (form.valid) {
      form.patchValue({
        expired_at: new Date(form.value.expired_at).toLocaleDateString('en-CA'),
      });
      this._ComplaintsService.updateIssue(form.value).subscribe((res: any) => {
        if (res.status == 1) {
          this._MessageService.add({
            severity: 'success',
            summary: 'Update Form',
            detail: 'Complaint updated successfully',
          });
          this._Router.navigate(['complaints/show']);
        }
      });
    }
  }
}
