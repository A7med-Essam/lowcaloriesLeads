import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { AgentTargetService } from 'src/app/services/agent-target.service';
import { AnalysisService } from 'src/app/services/analysis.service';
import { LocalService } from 'src/app/services/local.service';
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-create-analysis2',
  templateUrl: './create-analysis2.component.html',
  styleUrls: ['./create-analysis2.component.scss'],
})
export class CreateAnalysis2Component implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  analyticOptions: any;
  emirates: any[] = [];
  analysisForm!: FormGroup;
  creatingStatus: boolean = false;
  cids: any[] = [];
  options: any[] = [];
  showBranch: boolean = false;
  current_user: any;
  isSearching: boolean = false;
  constructor(
    private _AnalysisService: AnalysisService,
    private _RefundService: RefundService,
    private fb: FormBuilder,
    private _MessageService: MessageService,
    private _LocalService: LocalService
  ) {}

  ngOnInit(): void {
    this.createAnalysisForm();
    this.getFormAnalytics();
    this.current_user = this._LocalService.getJsonValue(
      'userInfo_oldLowCalories'
    );
  }

  currentNumber: string = '';
  getCustomerCID(e: HTMLInputElement) {
    if (
      e.value != '' &&
      e.value.length == 10 &&
      e.value != this.currentNumber
    ) {
      this.currentNumber = e.value;
      this.isSearching = true;
      this._AnalysisService.getFormAnalytics().subscribe((res) => {
        this.analyticOptions = res.data.options;
        this.emirates = res.data.emirates;
        this.options = [res.data.options];
        this.analysisForm.controls.customer_status.enable();
        this.analysisForm.patchValue({ cid: '', customer_name: '' });
        this.getCIDs(e.value);
      });
    }
  }

  checkCustomerExsist(number: any) {
    this._AnalysisService.checkPhoneNumberExist(number).subscribe((res) => {
      if (res.status == 1) {
        this.cids = res.data.cids;
        this.analysisForm.patchValue({
          customer_name: `${res.data.first_name} ${res.data.last_name}`,
          emirate_id: res.data.emirate_id,
          customer_gender: res.data.gender,
        });
        this.analysisForm.controls.customer_name.disable();
        this.analysisForm.controls.customer_gender.disable();
        this.changeCustomerStatus('old');
      } else {
        this.filterByMobile(number);
      }
    });
  }

  filterByMobile(mobile: number) {
    this._AnalysisService
      .filterAnalyticsByMobile({ mobile })
      .subscribe((res) => {
        if (res.data.length) {
          this.analysisForm.patchValue({
            customer_name: res.data[0].customer_name,
            emirate_id: res.data[0].emirate_id,
            customer_gender: res.data[0].customer_gender,
          });
          this.analysisForm.controls.customer_name.disable();
          this.analysisForm.controls.customer_gender.disable();
          this.isSearching = false;
        } else {
          this.analysisForm.controls.customer_gender.enable();
          this.analysisForm.controls.customer_name.enable();
          this.changeCustomerStatus('new');
        }
      });
  }

  changeCustomerStatus(type: string) {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data.options;
      this.emirates = res.data.emirates;
      this.options = [res.data.options];
      if (type == 'old') {
        const keywordsToInclude = ['old', 'exist'];
        const filteredData = this.analyticOptions.filter((item: any) =>
          keywordsToInclude.some((keyword) =>
            item.name.toLowerCase().includes(keyword)
          )
        );
        this.options = [filteredData];
        this.isSearching = false;
      } else {
        const keywordsToInclude = ['old', 'exist'];
        const filteredData = this.analyticOptions.filter(
          (item: any) =>
            !keywordsToInclude.some((keyword) =>
              item.name.toLowerCase().includes(keyword)
            )
        );
        this.options = [filteredData];
        this.isSearching = false;
      }
    });
  }

  onEnterKey(e: any) {
    e.preventDefault();
    // this.getCIDs(e.target.value);
    this.getCustomerCID(e.target);
  }

  getCIDs(value: string) {
    this._RefundService.getCIDs(value).subscribe((res) => {
      this.cids = res;
      if (res.length == 0) {
        this.checkCustomerExsist(value);
        this.showBranch = false;
      } else {
        this.showBranch = true;
        this.analysisForm.controls.customer_name.disable();
        this.analysisForm.controls.customer_branch.disable();
        this.isSearching = false;
      }
    });
  }

  getCustomerInfo(e: any) {
    this.isSearching = true;
    const selectedCID = this.cids.find((c) => c.cid == e.value);
    this._RefundService.getPlanDetails(selectedCID.cid).subscribe((res) => {
      this.isSearching = false;
      this.analysisForm.patchValue({
        customer_name: res.customerName,
        customer_branch: res.deliveryBranch,
      });
    });
    this.setCustomerStatus(selectedCID.remainingDays);
  }

  setCustomerStatus(remainingDays: number) {
    if (remainingDays > 0) {
      const data = { value: this.filterCustomerStatus('Exist Customer')?.name };
      this.storeSelectedOptions(data, 0);
      this.analysisForm.patchValue({
        customer_status: this.filterCustomerStatus('Exist Customer')?.name,
      });
    } else {
      const data = { value: this.filterCustomerStatus('Old Customer')?.name };
      this.storeSelectedOptions(data, 0);
      this.analysisForm.patchValue({
        customer_status: this.filterCustomerStatus('Old Customer')?.name,
      });
    }
    this.analysisForm.controls.customer_status.disable();
  }

  filterCustomerStatus(status: string) {
    if (this.options && this.options.length) {
      return this.options[0].filter(
        (o: any) => o.name.toLowerCase() === status.toLowerCase()
      )[0];
    } else {
      return status;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  createAnalysisForm() {
    this.analysisForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern('^[\\d]{10}$')]],
      cid: '',
      customer_branch: '',
      emirate_id: '',
      customer_name: '',
      customer_gender: '',
      customer_status: '',
      data_options: '',
      notes: '',
      reminder_date: '',
    });
  }

  getFormAnalytics() {
    this._AnalysisService.getFormAnalytics().subscribe((res) => {
      this.analyticOptions = res.data.options;
      this.emirates = res.data.emirates;
      this.options = [res.data.options];
    });
  }

  create(form: FormGroup) {
    if (form.valid) {
      this.isSearching = true;
      this.creatingStatus = true;
      if (form.value.reminder_date) {
        this.analysisForm.patchValue({
          reminder_date: new Date(form.value.reminder_date)
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .split('.')[0],
        });
      }
      if (form.value.notes) {
        this.analysisForm.patchValue({
          notes: `${this.current_user.name} => ${form.value.notes}`,
        });
      }

      this.analysisForm.patchValue({
        data_options: this.buildHierarchy(),
      });
      this._AnalysisService
        .createAnalytics2(form.getRawValue())
        .subscribe((res) => {
          if (res.status == 1) {
            this.creatingStatus = false;
            this.isSearching = false;

            // this.analysisForm.reset();
            // this.createAnalysisForm();
            this._MessageService.add({
              severity: 'success',
              summary: 'Analytics',
              detail: 'Analytics Created Successfully',
            });
            this.analysisForm?.get('notes')?.reset();
          } else {
            this.creatingStatus = false;
            this.isSearching = false;

            if (form.value.reminder_date != null) {
              this.analysisForm.patchValue({
                reminder_date: new Date(form.value.reminder_date),
              });
            }
          }
        });
    }
  }

  storeSelectedOptions(e: any, index: number) {
    const selectedIndex = this.getArrayIndex(e.value, index);
    this.options.splice(index + 1);
    if (this.options[index][selectedIndex]?.has_children) {
      if (this.options[index][selectedIndex].children) {
        this.options.push(this.options[index][selectedIndex].children);
      } else {
        this.isSearching = true;
        this._AnalysisService
        .getAnalyticsChildrenById(this.options[index][selectedIndex].id)
        .subscribe((res) => {
            this.isSearching = false;
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
    // return this.convertHierarchy(outputArray.map((e) => e.name));
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
