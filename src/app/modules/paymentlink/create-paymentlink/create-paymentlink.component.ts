import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { Subscription } from 'rxjs';
import {
  PaymentDetails,
  PaymentlinkService,
  Programs,
} from 'src/app/services/paymentlink.service';

@Component({
  selector: 'app-create-paymentlink',
  templateUrl: './create-paymentlink.component.html',
  styleUrls: ['./create-paymentlink.component.scss'],
})
export class CreatePaymentlinkComponent implements OnInit, OnDestroy {
  PaymentLink!: string|undefined;
  exchangeStatus: boolean = false;
  mealTypes: string[] = [];
  snackTypes: string[] = [];
  plans: any[] = [];
  numberOfDays: any[] = [];
  paymentDetails!: PaymentDetails;
  paymentForm!: FormGroup;
  gender: string[] = ['male', 'female'];
  creatingStatus: boolean = false;
  days: { name: string; value: string }[] = [
    { name: 'Saturday', value: 'Sat' },
    { name: 'Sunday', value: 'Sun' },
    { name: 'Monday', value: 'Mon' },
    { name: 'Tuesday', value: 'Tue' },
    { name: 'Wednesday', value: 'Wed' },
    { name: 'Thursday', value: 'Thu' },
    { name: 'Friday', value: 'Fri' },
  ];
  valueChangesSubscription1!: Subscription | undefined;
  valueChangesSubscription2!: Subscription | undefined;
  valueChangesSubscription3!: Subscription | undefined;

  ngOnDestroy() {
    if (
      this.valueChangesSubscription1 &&
      this.valueChangesSubscription2 &&
      this.valueChangesSubscription3
    ) {
      this.valueChangesSubscription1.unsubscribe();
      this.valueChangesSubscription2.unsubscribe();
      this.valueChangesSubscription3.unsubscribe();
    }
  }

  constructor(
    private _PaymentlinkService: PaymentlinkService,
    private _MessageService: MessageService
  ) {}

  @ViewChildren('deliveryDaysBox') DeliveryCheckboxElements!: QueryList<Checkbox>;
  ngOnInit(): void {
    this.createPaymentForm();
    this.getPaymentDetails();
    this.selectAllDeliveryDays();
  }

  selectAllDeliveryDays(){
    setTimeout(() => {
      this.DeliveryCheckboxElements.forEach((checkbox: Checkbox) => {
        checkbox.updateModel(true)
      });
    }, 1);
  }

  getPaymentDetails() {
    this._PaymentlinkService.getPaymentDetails().subscribe((res) => {
      if (res.status == 1) {
        this.paymentDetails = res.data;
        this.emiratesClone = this.paymentDetails.emirates
        this.paymentDetails.GiftCodes = this.paymentDetails.GiftCodes.map( c => {
          return {
            code:`${c.code} (${c.percentage}%)`,
            id:c.id,
            percentage:c.percentage
          }
        })
      }
    });
  }

  getEmailByMobile(mobile:string) {
    this._PaymentlinkService.checkMobileEmails(mobile).subscribe((res) => {
      this.paymentForm.patchValue({
        email: res.data,
      });
    });
  }

  currentPrice:number = 0
  calculate_payment_link(){
    const data = {
      program_id:this.paymentForm.value.program_id,
      plan_id:this.paymentForm.value.plan_id,
      meal_types:this.paymentForm.value.meal_types,
      snack_types:this.paymentForm.value.snack_types,
      subscription_days:this.paymentForm.value.subscription_days,
      code_id:this.paymentForm.value.code_id,
      bag:this.paymentForm.value.bag
    }
    this._PaymentlinkService.calculate_payment_link(data).subscribe(res=>{
      if (res.status == 1) {
        this.currentPrice = res.data.toFixed(2)
      }
    })
  }

  createPaymentForm() {
    this.paymentForm = new FormGroup({
      first_name: new FormControl(null, [Validators.required]),
      last_name: new FormControl(null, [Validators.required]),
      phone_number: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[\\d]{10}$'),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      gender: new FormControl(null, [Validators.required]),
      height: new FormControl(null, [Validators.required]),
      Weight: new FormControl(null, [Validators.required]),
      birthday: new FormControl(null, [Validators.required]),
      program_type: new FormControl(null, [Validators.required]),
      program: new FormControl(null, [Validators.required]),
      program_id: new FormControl(null, [Validators.required]),
      plan_id: new FormControl(null),
      meal_types: new FormArray([], [Validators.required]),
      snack_types: new FormArray([]),
      subscription_days: new FormControl(null, [Validators.required]),
      delivery_days: new FormArray([], [Validators.required]),
      start_date: new FormControl(null, [Validators.required]),
      emirate_id: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      code_id: new FormControl(null, [Validators.required]),
      bag: new FormControl('no', [Validators.required]),
      cutlery: new FormControl('no', [Validators.required]),
      exchange_paymentLink: new FormControl('no', [Validators.required]),
      dislike: new FormArray([]),
      branch_paid_on_id: new FormControl(null),
      branch_invoice_image: new FormControl(null),
    });
    this.valueChanges();
  }

  getNumberOfDays(min: number, max: number): string[] {
    const result: string[] = [];
    for (let i = min; i <= max; i++) {
      result.push(i.toString());
    }
    return result;
  }

  createPaymentLink(form: FormGroup) {
    if (form.valid) {
      this.creatingStatus = true;
      form.patchValue({
        birthday: new Date(form.value.birthday).toLocaleDateString('en-CA'),
        start_date: new Date(form.value.start_date).toLocaleDateString('en-CA'),
      });
      const filteredData = Object.keys(form.value)
        .filter(
          (key) =>
            form.value[key] !== null &&
            !(Array.isArray(form.value[key]) && form.value[key].length === 0)
        )
        .reduce((obj: any, key) => {
          obj[key] = form.value[key];
          return obj;
        }, {});
        if (filteredData.dislike) {
          filteredData.dislike = filteredData.dislike.join(',');
        }
      this._PaymentlinkService
        .create_payment_link(filteredData)
        .subscribe({
          next:(res) => {
            if (res.status == 1) {
              this.creatingStatus = false;
              this.PaymentLink = res.data;
              this.paymentForm.reset();
              this.createPaymentForm();
              this.uncheckAllCheckboxes();
              this.exchangeStatus = false;
              this._MessageService.add({
                severity: 'success',
                summary: 'Payment Created Successfully',
                detail: 'Payment link returned',
              });
            }
            else{
              this.creatingStatus = false;
              this.paymentForm.patchValue({ start_date: new Date(filteredData.start_date),birthday: new Date(filteredData.birthday) });
            }
          },
          error:err=>{
            this.creatingStatus = false;
            this.paymentForm.patchValue({ start_date: new Date(filteredData.start_date),birthday: new Date(filteredData.birthday) });
          }
        });
    }
  }

  // ====================================================================UPLOAD==========================================================================

  uploadFile(e: Event) {
    this.onFileChange(e);
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
          const [base64Strings] = await Promise.all(
            Array.from(files).map(readFile)
          );
          this.paymentForm.patchValue({
            branch_invoice_image: base64Strings,
          });
        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }

  getSelectedMealTypes(num: number, type: string) {
    let meals = [];
    for (let i = 1; i <= num; i++) {
      meals.push(`${type} ${i}`);
    }
    return meals;
  }

  // ====================================================================Copy Message==========================================================================
  copyMessage(Input: HTMLInputElement) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = Input.value;
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
  // ====================================================================Checkbox==========================================================================
  onCheckboxChange(event: any, type: string, value: string) {
    let formArray: FormArray = this.paymentForm.get(type) as FormArray;
    if (event.checked.length) {
      formArray.push(new FormControl(event.checked[0]));
    } else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: any) => {
        if (ctrl.value === value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }

    if (type != 'snack_types' && type != 'dislike') {
      if (formArray.length > 0) {
        this.paymentForm.get(type)?.setErrors(null);
      } else {
        this.paymentForm.get(type)?.setErrors({ required: true });
      }
    }
  }

  @ViewChildren('checkbox') checkboxElements!: QueryList<Checkbox>;
  uncheckAllCheckboxes() {
    this.checkboxElements.forEach((checkbox: Checkbox) => {
      checkbox.writeValue(false);
    });
  }

  // ====================================================================Value Changes==========================================================================
  isCustom: Boolean = true;
  emiratesClone:any;
  customEmirateFilter(type: string) {
    if (type === "Chef Gourmet") {
      const emiratesFilterOptions = ["DUBAI", "SHARJAH", "ABU DHABI"];
      const filteredEmirates: any[] = [];
  
      for (const filterValue of emiratesFilterOptions) {
        const filteredResults = this.paymentDetails.emirates.filter((e: any) =>
          e.en_name.toLowerCase().includes(filterValue.toLowerCase())
        );
        filteredEmirates.push(...filteredResults);
      }
      const uniqueData = filteredEmirates.filter((item, index, self) =>
        index === self.findIndex((t) => t.en_name === item.en_name)
      );
      return uniqueData;
    } else {
      return this.emiratesClone;
    }
  }
  
  valueChanges() {
    this.valueChangesSubscription1 = this.paymentForm
      .get('program_type')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.paymentDetails.emirates = this.customEmirateFilter(value);
          this.handleProgramTypeChange(value);
        }
      });
    this.valueChangesSubscription2 = this.paymentForm
      .get('program')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.handleProgramIdChange(value);
        }
      });

    this.valueChangesSubscription3 = this.paymentForm
      .get('exchange_paymentLink')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.handleExchangePaymentLinkChange(value);
        }
      });
  }

  handleProgramTypeChange(value: any) {
    this.handelMealTypes();
    this.resetFormFields();
    value.toLowerCase().includes('custom')
      ? (this.isCustom = true)
      : (this.isCustom = false);
    if (this.isCustom) {
      this.plans = this.paymentDetails.Programs[value][0].plans;
    } else {
      this.plans = this.paymentDetails.Programs[value];
    }
  }

  handleProgramIdChange(value: any) {
    this.handelMealTypes();
    this.handelPlanId();
    if (this.isCustom) {
      this.mealTypes = this.getSelectedMealTypes(
        value.details.max_meal,
        'Meal'
      );
      this.snackTypes = this.getSelectedMealTypes(
        value.details.max_snack,
        'Snack'
      );
      this.numberOfDays = this.getNumberOfDays(
        value.details.min_days,
        value.details.max_days
      );
      this.paymentForm.patchValue({
        program_id: value.program_id,
        plan_id: value.id,
      });
    } else {
      this.paymentForm.patchValue({ program_id: value.id });
      this.mealTypes = this.getSelectedMealTypes(value.max_meals, 'Meal');
      this.snackTypes = this.getSelectedMealTypes(value.no_snacks, 'Snack');
    }
  }

  handleExchangePaymentLinkChange(value: string) {
    if (value == 'yes') {
      this.exchangeStatus = true;
      this.paymentForm
        .get('branch_invoice_image')
        ?.setValidators([Validators.required]);
      this.paymentForm
        .get('branch_paid_on_id')
        ?.setValidators([Validators.required]);
    } else {
      this.paymentForm.patchValue(
        {
          branch_invoice_image: null,
          branch_paid_on_id: null,
        },
        { emitEvent: false }
      );
      this.exchangeStatus = false;
      this.paymentForm.get('branch_invoice_image')?.clearValidators();
      this.paymentForm.get('branch_paid_on_id')?.clearValidators();
    }
    this.paymentForm
      .get('branch_invoice_image')
      ?.updateValueAndValidity({ emitEvent: false });
    this.paymentForm
      .get('branch_paid_on_id')
      ?.updateValueAndValidity({ emitEvent: false });
  }

  resetFormFields() {
    this.paymentForm.patchValue({
      program: null,
      program_id: null,
      plan_id: null,
      subscription_days: null,
    });
  }

  handelPlanId() {
    if (this.isCustom) {
      this.paymentForm.get('plan_id')?.setValidators([Validators.required]);
    } else {
      this.paymentForm.patchValue({ plan_id: null });
      this.paymentForm.get('plan_id')?.clearValidators();
      this.paymentForm
        .get('plan_id')
        ?.updateValueAndValidity({ emitEvent: false });
    }
  }

  handelMealTypes() {
    this.mealTypes = [];
    this.snackTypes = [];
    this.paymentForm.removeControl('meal_types');
    this.paymentForm.addControl(
      'meal_types',
      new FormArray([], [Validators.required])
    );
    this.paymentForm.removeControl('snack_types');
    this.paymentForm.addControl('snack_types', new FormArray([]));
  }
}
