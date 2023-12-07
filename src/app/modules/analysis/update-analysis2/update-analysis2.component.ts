import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { AnalysisService } from 'src/app/services/analysis.service';
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-update-analysis2',
  templateUrl: './update-analysis2.component.html',
  styleUrls: ['./update-analysis2.component.scss'],
})
export class UpdateAnalysis2Component implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  analyticOptions: any;
  emirates: any[] = [];
  analysisForm!: FormGroup;
  analysisOptionForm!: FormGroup;
  creatingStatus: boolean = false;
  cids: any[] = [];
  options: any[] = [];
  currentRow: any;

  constructor(
    private _AnalysisService: AnalysisService,
    private _RefundService: RefundService,
    private fb: FormBuilder,
    private _MessageService: MessageService,
    private _Router: Router
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.createAnalysisForm();
    this.showDetails();
  }

  createAnalysisForm() {
    this.analysisForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern('^[\\d]{10}$')]],
      cid: '',
      customer_name: '',
      customer_gender: '',
      customer_branch: '',
      data_options: '',
      emirate_id: '',
      dataRequest_id: '',
      reminder_date: '',
      notes:''
    });
  }

  showDetails() {
    this._AnalysisService.analysisV2
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((analysis) => {
        if (analysis) {
          this.currentRow = analysis;
          this.getAnalyticsOptions();
          this.getAllAnalyticOptions();
          this.addControls();
          this.patchValues(analysis);
        } else {
          this._Router.navigate(['analysis/showV2']);
        }
      });
  }

  getAnalyticsOptions() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data.options;
      this.emirates = res.data.emirates;
      this.options = [res.data.options];
    });
  }

  patchValues(value: any) {
    this.analysisForm.patchValue({
      mobile: value.mobile,
      customer_name: value.customer_name,
      customer_gender: value.customer_gender,
      customer_branch: value?.customer_branch,
      emirate_id: value?.emirate?.id,
      notes: value.notes ? value.notes : null,
      reminder_date: value.reminder_date ? new Date(value.reminder_date) : null,
      dataRequest_id: value.id,
    });
    this.getCustomerCID(value.mobile, value.cid);
  }

  getCustomerCID(value: string, cid?: number) {
    if (value != '') {
      this._RefundService.getCIDs(value).subscribe((res) => {
        this.cids = res;
        if (res.length == 0) {
          // this.checkCustomerExsist(value);
        } else {
          if (cid) {
            this.analysisForm.patchValue({ cid });
            this.getCustomerInfo({ value: cid });
          }
        }
      });
    }
  }

  getCustomerInfo(e: any) {
    const selectedCID = this.cids.find((c) => c.cid == e.value);
    this._RefundService.getPlanDetails(selectedCID.cid).subscribe((res) => {
      this.analysisForm.patchValue({
        customer_name: res.customerName,
        customer_branch: res.deliveryBranch,
      });
    });
    // this.setCustomerStatus(selectedCID.remainingDays);
  }

  allAnalyticOptions: any;
  getAllAnalyticOptions() {
    // this._AnalysisService.getAllAnalyticOptions().subscribe((res) => {
    //   this.allAnalyticOptions = res.data;
    // });
    this.allAnalyticOptions = []
  }

  addControls() {
    const labels: string[] = this.selectedLabels;
    const values: string[] = this.selectedValues;
    labels.forEach((c, index) => {
      this.analysisForm.addControl(c, this.fb.control(values[index]));
      this.analysisForm.get(c)?.disable();
    });
  }

  get selectedLabels(): string[] {
    return this.currentRow?.data_options.map((item: any) => item.label);
  }

  get selectedValues(): string[] {
    return this.currentRow?.data_options.map((item: any) => item.name);
  }

  update(form: FormGroup) {
    if (form.valid) {
      this.creatingStatus = true;
      this.analysisForm.patchValue({
        data_options: this.buildHierarchy(),
      });
      this._AnalysisService
        .updateAnalytics2(form.getRawValue())
        .subscribe((res) => {
          this.creatingStatus = false;
          this._MessageService.add({
            severity: 'success',
            summary: 'Created Successfully',
            detail: res.message,
          });
          this._Router.navigate(['analysis/showV2']);
        });
    }
  }

  // storeSelectedOptions(e: any, index: number) {
  //   const selectedIndex = this.getArrayIndex(e.value, index);
  //   if (selectedIndex >= 0) {
  //     this.options.splice(index + 1);
  //     if (this.options[index][selectedIndex].has_children) {
  //       this.options.push(this.options[index][selectedIndex].children);
  //     }
  //   }
  // }

  storeSelectedOptions(e: any, index: number) {
    const selectedIndex = this.getArrayIndex(e.value, index);
    this.options.splice(index + 1);
    if (this.options[index][selectedIndex].has_children) {
      if (this.options[index][selectedIndex].children) {
        this.options.push(this.options[index][selectedIndex].children);
      } else {
        this._AnalysisService
          .getAnalyticsChildrenById(this.options[index][selectedIndex].id)
          .subscribe((res) => {
            this.options[index][selectedIndex].children = res.data;
            this.options.push(this.options[index][selectedIndex].children);
          });
      }
    }
  }

  getArrayIndex(name: string, index: number) {
    if (this.options[index]) {
      this.options[index].map((option: any) => {
        option.selected = false;
        if (option.name === name) {
          option.selected = true;
        }
      });
      return this.options[index].findIndex(
        (option: any) => option.name === name
      );
    }
    return -1;
  }

  filterSelected(arr: any[]) {
    const result: any[] = [];

    arr.forEach((item) => {
      if (item.hasOwnProperty('selected') && item.selected === true) {
        result.push(item);
      }

      if (item.children && item.children.length > 0) {
        const filteredChildren = this.filterSelected(item.children);
        if (filteredChildren.length > 0) {
          const newItem = { ...item, children: filteredChildren };
          result.push(newItem);
        }
      }
    });

    return result;
  }

  buildHierarchy() {
    const filteredArray = this.options.map((subArray: any) =>
      this.filterSelected(subArray)
    );
    let outputArray: any[] = [];
    filteredArray.forEach((innerArray) => {
      if (innerArray.length > 0) {
        outputArray.push(innerArray[0]);
      }
    });
    let data: any[] = [];
    outputArray.map((e) => {
      return data.push({
        label: e.label,
        name: e.name,
      });
    });
    return data;
  }

    // ================================== REMINDER ==================================
    minReminder: Date = new Date(new Date().setDate(new Date().getDate() + 1));
    maxReminder: Date = new Date(new Date().setDate(new Date().getDate() + 90));
    defaultReminder: Date = new Date(this.calculateDefaultReminder());
    reminderModal: boolean = false;
  
    private calculateDefaultReminder(): Date {
      const currentDate = new Date();
      const twoDaysLater = new Date(
        currentDate.setDate(currentDate.getDate() + 2)
      );
      return twoDaysLater;
    }
  
    setDefaultReminder() {
      this.analysisForm.get('reminder_date')?.setValue(this.defaultReminder);
      this.reminderModal = false;
      this._MessageService.add({
        severity: 'success',
        summary: 'Reminder',
        detail: 'Reminder has been add successfully',
      });
    }
}
