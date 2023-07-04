import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DislikeService } from 'src/app/services/dislike.service';
import { LocalService } from 'src/app/services/local.service';
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-create-refund',
  templateUrl: './create-refund.component.html',
  styleUrls: ['./create-refund.component.scss'],
})
export class CreateRefundComponent implements OnInit {
  constructor(
    private _RefundService: RefundService,
    private _LocalService: LocalService,
    private _MessageService: MessageService,
    private _Location: Location,
    private _DislikeService: DislikeService
  ) {}
  selectedReason: any[] = [];

  ngOnInit(): void {
    this.createRefundForm();
    this.getReasons();
    // this.getDeliveryTimes();
    // this.getFoodQuality();
  }

  addOption(el: HTMLInputElement) {
    if (el.value != '') {
      this.reasons.push({ name: el.value });
      this.selectedReason.push(el.value);
      el.value = '';
    }
  }

  insertForm!: FormGroup;
  CIDs: any[] = [];
  planDetails: any;
  getCustomerInfo(e: HTMLInputElement) {
    this.displayFormStatus = false;
    if (e.value.length == 10) {
      this._RefundService.getCIDs(e.value).subscribe((res) => {
        this.CIDs = res;
        this.planDetails = null;
        if (res.length == 0) {
          this._MessageService.add({
            severity: 'warn',
            summary: 'Error',
            detail: 'No Data Found For This Number',
          });
        }
      });
    } else {
      this.getPlanDetails(Number(e.value));
    }
  }

  getPlanDetails(cid: number) {
    this.displayFormStatus = false;
    this._RefundService.getPlanDetails(cid).subscribe({
      next: (res) => {
        this.planDetails = res;
        this.CIDs = [];
        if (res.invoices.length == 0) {
          this._MessageService.add({
            severity: 'warn',
            summary: 'Error',
            detail: 'This CID has no invoices',
          });
        }
      },
      error: (err) => {
        this._MessageService.add({
          severity: 'warn',
          summary: 'Error',
          detail: 'No Data Found For This CID',
        });
      },
    });
  }

  displayRefundForm(plan: any, invoice: any) {
    if (plan.remainingDays == 0) {
      this._MessageService.add({
        severity: 'warn',
        summary: 'Error',
        detail: 'This Plan Expired',
      });
    } else {
      this.insertForm.patchValue({
        name: plan.customerName,
        email: plan.email,
        mobile: plan.customerPhone,
        branch: invoice.branch,
        delivery_branch: invoice.deliverBranch,
        subscription_plan: plan.planTitle,
        remaining_days: plan.remainingDays,
        payment_method: invoice.paymentMethod,
        address: plan.deliveryAddress,
        cid: plan.cid,
        agent_id: this._LocalService.getJsonValue('userInfo_oldLowCalories').id,
        amount_paid: invoice.amount,
      });
      this.displayFormStatus = true;
    }
  }

  displayFormStatus: boolean = false;

  createRefundForm() {
    this.insertForm = new FormGroup({
      bank_name: new FormControl(null, [Validators.required]),
      iban: new FormControl(null, [Validators.required]),
      bank_account_number: new FormControl(null, [Validators.required]),
      account_hold_name: new FormControl(null, [Validators.required]),
      reason: new FormControl(null, [Validators.required]),
      name: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      email: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      mobile: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      branch: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      delivery_branch: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      subscription_plan: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      remaining_days: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      payment_method: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      address: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      cid: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      amount_paid: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
      agent_id: new FormControl(null),
      files: new FormControl(null),
      // food_qualities: new FormControl(null, [Validators.required]),
      // delivery_times: new FormControl(null, [Validators.required]),
    });
  }

  reasons: any[] = [];
  getReasons() {
    this._RefundService.getRefundReasons().subscribe({
      next: (res) => (this.reasons = res.data),
    });
  }

  // deliveryTimes: any[] = [];
  // getDeliveryTimes() {
  //   this._RefundService.getDeliveryTimes().subscribe({
  //     next: (res) => (this.deliveryTimes = res.data),
  //   });
  // }

  // foodQualities: any[] = [];
  // getFoodQuality() {
  //   this._RefundService.getFoodQuality().subscribe({
  //     next: (res) => (this.foodQualities = res.data),
  //   });
  // }

  insertRefund(form: FormGroup) {
    if (form.valid) {
      this._RefundService
        .addRefund(this.insertForm.getRawValue())
        .subscribe((res) => {
          if (res.status == 1) {
            this.insertForm.reset();
            this.displayFormStatus = false;
            this.planDetails = null;
            this.CIDs = [];
            this._MessageService.add({
              severity: 'success',
              summary: 'Refund Form',
              detail: 'Refund Added successfully',
            });
          }
        });
    }
  }

  goBack(): void {
    this._Location.back();
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
