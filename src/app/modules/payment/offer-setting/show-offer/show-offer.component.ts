import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GuardService } from 'src/app/services/guard.service';
import { PaymentlinkService } from 'src/app/services/paymentlink.service';
import { SurveyService } from 'src/app/services/survey.service';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-show-offer',
  templateUrl: './show-offer.component.html',
  styleUrls: ['./show-offer.component.scss'],
})
export class ShowOfferComponent implements OnInit {
  constructor(
    private _PaymentlinkService: PaymentlinkService,
    private _GuardService: GuardService,
    private confirmationService: ConfirmationService,
    private _Router: Router,
    private _SurveyService: SurveyService,
    private _MessageService: MessageService
  ) {}

  createPermission: boolean = false;
  deletePermission: boolean = false;
  updatePermission: boolean = false;

  uploadFile(offerId: any) {
    let input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.addEventListener('change', (event) => {
      const files: FileList | null = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file: File = files[0];
        const type = file.type.split('/')[0];
        if (type != 'video' && type != 'image') {
          this._MessageService.add({
            severity: 'error',
            summary: 'Error ',
            detail: 'This Type Of File Not Supported',
          });
        } else {
          this.updateOfferFile(file, type, offerId);
        }
      }
    });
    input.click();
  }
  updateOfferFile(file: File, type: string, offerId: any) {
    let formData = new FormData();
    formData.append('offer_id', offerId);
    formData.append('content_type', type);
    formData.append('content_url', file);
    this._PaymentlinkService.updateOfferFile(formData).subscribe((res) => {
      this.getOfferSettings();
      this.detailsModal = false;
      this._MessageService.add({
        severity: 'success',
        summary: 'Upload File',
        detail: 'File Uploaded Successfully',
      });
    });
  }
  getPermission() {
    this.createPermission =
      this._GuardService.getPermissionStatus('create_offer');
    this.deletePermission =
      this._GuardService.getPermissionStatus('delete_offer');
    this.updatePermission =
      this._GuardService.getPermissionStatus('update_offer');
  }

  offer: any[] = [];

  ngOnInit(): void {
    this.getPermission();
    this.getOfferSettings();
    this.getAgents();
  }

  getOfferSettings() {
    this._PaymentlinkService.getOfferSettings().subscribe({
      next: (res) => {
        this.offer = res.data;
      },
    });
  }

  deleteRow(id: number) {
    if (this.deletePermission) {
      // this._UploadService.deleteFile(id).subscribe((res) => {
      //   this.getFiles();
      // });
    }
  }

  confirm(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }

  currentRow: any;
  detailsModal: boolean = false;
  showRow(row: any) {
    this.currentRow = row;
    this.detailsModal = true;
  }

  removeObjectValues(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        delete obj[key];
      }
    }
    return obj;
  }

  updateRow(row: any) {
    this._PaymentlinkService.offer.next(row);
    this._Router.navigate(['offer-settings/updateOffer']);
  }

  agentLinkModal: boolean = false;
  currentRow2: any;
  showRow2(row: any) {
    this.currentRow2 = row;
    this.agentLinkModal = true;
  }

  agents: any[] = [];
  getAgents() {
    this._SurveyService.getAllAgents().subscribe({
      next: (res) => {
        this.agents = res.data.filter(
          (f: any) => f.team != 'Management' && f.team != 'Branches'
        );
      },
    });
  }

  copyMessage(link: string, id: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = link + '/' + id;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this._MessageService.add({
      severity: 'success',
      summary: 'Notification ',
      detail: 'Copied to clipboard!',
    });
  }
}
