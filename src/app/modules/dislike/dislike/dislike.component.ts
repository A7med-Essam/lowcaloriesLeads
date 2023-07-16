import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit,Renderer2  } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';

@Component({
  selector: 'app-dislike',
  templateUrl: './dislike.component.html',
  styleUrls: ['./dislike.component.scss'],
})
export class DislikeComponent implements OnInit {
  customerInfo: any[] = [];
  branches: any[] = [];
  meals: any[] = [];
  reasons: any[] = [];
  selectedMeals: any[] = [];
  selectedBranch: any[] = [];
  selectedReason: any[] = [];

  constructor(
    private _DislikeService: DislikeService,
    private _LocalService: LocalService,
    private _MessageService: MessageService,
    private _Router: Router,
    private renderer: Renderer2,
    private _Location:Location
  ) {}

  goBack(): void {
    // if (this._LocalService.getJsonValue('returnUrl')) {
      // this._Router.navigate([this._LocalService.getJsonValue('returnUrl')]);
    // }else{
      this._Location.back();
    // }
  }

  // ngOnDestroy(): void {
    // this.renderer.removeClass(document.body, 'h-side');
  // }
  ngOnInit(): void {
    this.getMeals();
    this.getReasons();
    this.getAgentBranches();
    // this.renderer.addClass(document.body, 'h-side');
  }

  addOption(el: HTMLInputElement) {
    if (el.value != '') {
      this.reasons.push({ reason: el.value });
      this.selectedReason.push(el.value);
      el.value = '';
    }
  }

  currentCID: number = 0;
  getCustomerInfo(CID_Input: HTMLInputElement) {
    this.currentCID = Number(CID_Input.value);
    this._DislikeService.getCustomerInfo(Number(CID_Input.value)).subscribe({
      next: (res) => (this.customerInfo = res.data),
    });
  }

  getMeals() {
    this._DislikeService.getMeals().subscribe({
      next: (res) => (this.meals = res.data),
    });
  }

  getReasons() {
    this._DislikeService.getReasons().subscribe({
      next: (res) => (this.reasons = res.data),
    });
  }

  getAgentBranches() {
    this._DislikeService.getAgentBranches().subscribe({
      next: (res) => (this.branches = res.data),
    });
  }

  storeDislikeRequest() {
    const data = {
      name: this.customerInfo[0]?.CustomerName,
      email: this.customerInfo[0]?.CustomerEmail,
      mobile: [
        this.customerInfo[0]?.CustomerMobile,
        this.customerInfo[0]?.CustomerPhone,
      ],
      branch: this.customerInfo[0]?.CustomerAddress3,
      dislike_meals: this.selectedMeals,
      sent_by: this.selectedBranch,
      reasons: this.selectedReason,
      cid: this.currentCID,
      agent_id: this._LocalService.getJsonValue('userInfo_oldLowCalories').id,
      files:this.files
    };

    this._DislikeService.storeDislikeRequest(data).subscribe({
      next: (res) => {
        this._MessageService.add({
          severity: 'success',
          summary: 'Notification',
          detail: res.message,
        });
        this._Router.navigate(['dislike/show']);
      },
    });
  }
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
  
    files:any[]=[]
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
            this.files = fileTypes
            // this.insertForm.patchValue({
            //   files: fileTypes,
            // });
          } catch (error) {
            console.error(error);
          }
        };
  
        readFiles();
      }
    }
}
