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
      status: new FormControl(null, [Validators.required]),
      agent_id: new FormControl(null),
      files: new FormControl(null),
    });
  }

  // ================================== OPTIONS =========================================

  branches: any[] = [];

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  // ================================== STATUS =========================================
  status :string[] = ["open","closed"]
  // ====================================================================UPLOAD==========================================================================

  uploadFile() {
    let input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.multiple = true;
    input.click();
    input.onchange = (e) => {
      this.onFileChange(e);
    };
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      const files = event.target.files;
      const readFile = (file: any) => {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = (event: any) => resolve(event.target.result);
          fileReader.onerror = (error) => reject(error);
          fileReader.readAsDataURL(file);
        });
      };

      const readFiles = async () => {
        try {
          const base64Strings = await Promise.all(
            Array.from(files).map(readFile)
          );

          const fileTypes = base64Strings.map((base64String: any) => {
            const type = base64String.split(',')[0].split(':')[1].split(';')[0];
            return { [type]: base64String };
          });

          this.insertForm.patchValue({
            files: fileTypes,
          });
        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }
}
