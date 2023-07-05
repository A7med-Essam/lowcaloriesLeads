import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
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
  PaymentLink!: string;
  exchangeStatus: boolean = false;
  mealTypes: string[] = [];
  snackTypes: string[] = [];
  plans: any[] = [];
  numberOfDays: any[] = [];
  paymentDetails!: PaymentDetails;
  paymentForm!: FormGroup;
  gender: string[] = ['male', 'female'];
  days: { name: string; value: string }[] = [
    { name: 'Saturday', value: 'Sat' },
    { name: 'Sunday', value: 'Sun' },
    { name: 'Monday', value: 'Mon' },
    { name: 'Tuesday', value: 'Tue' },
    { name: 'Wednesday', value: 'Wed' },
    { name: 'Thursday', value: 'Thu' },
    { name: 'Friday', value: 'Fri' },
  ];
  valueChangesSubscription!: Subscription | undefined;
  valueChangesSubscription2!: Subscription | undefined;

  ngOnDestroy() {
    if (this.valueChangesSubscription && this.valueChangesSubscription2) {
      this.valueChangesSubscription.unsubscribe();
      this.valueChangesSubscription2.unsubscribe();
    }
  }

  constructor(
    private _PaymentlinkService: PaymentlinkService,
    private _MessageService: MessageService,
    private _FormBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createPaymentForm();
    this.getPaymentDetails();
  }

  getPaymentDetails() {
    this._PaymentlinkService.getPaymentDetails().subscribe((res) => {
      if (res.status == 1) {
        this.paymentDetails = res.data;
      }
    });
  }

  createPaymentForm() {
    this.paymentForm = new FormGroup({
      first_name: new FormControl(null, [Validators.required]),
      last_name: new FormControl(null, [Validators.required]),
      phone_number: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      gender: new FormControl(null, [Validators.required]),
      height: new FormControl(null, [Validators.required]),
      Weight: new FormControl(null, [Validators.required]),
      birthday: new FormControl(null, [Validators.required]),
      program_type: new FormControl(null, [Validators.required]),
      program_id: new FormControl(null, [Validators.required]),
      plan_id: new FormControl(null, [Validators.required]),
      meal_types: new FormArray([], [Validators.required]),
      snack_types: new FormArray([]),
      subscription_days: new FormControl(null, [Validators.required]),
      delivery_days: new FormArray([], [Validators.required]),
      start_date: new FormControl(null, [Validators.required]),
      emirate_id: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      code_id: new FormControl(null, [Validators.required]),
      bag: new FormControl(null, [Validators.required]),
      cutlery: new FormControl(null, [Validators.required]),
      exchange_paymentLink: new FormControl('no', [Validators.required]),
      dislike: new FormArray([], [Validators.required]),
      branch_paid_on_id: new FormControl(null),
      branch_invoice_image: new FormControl(null),
    });
    this.valueChanges();
  }

  isCustom: Boolean = true;
  valueChanges() {
    this.valueChangesSubscription = this.paymentForm.valueChanges.subscribe(
      (value) => {
        if (value.program_type) {
          this.isCustom =
            this.paymentDetails.Programs[value.program_type][0].plans !=
            undefined;
          if (!this.isCustom) {
            this.plans = this.paymentDetails.Programs[value.program_type];
            this.mealTypes = [];
          } else {
            this.plans =
              this.paymentDetails.Programs[value.program_type][0].plans;
            this.mealTypes = this.getSelectedMealTypes(
              this.paymentDetails.Programs[value.program_type][0].plans[0]
                .details.max_meal,
              'Meal'
            );
          }
        }
        if (value.program_id) {
          if (!this.isCustom) {
            const [plan] = this.paymentDetails.Programs[
              value.program_type
            ].filter((e) => e.id === value.program_id);
            this.paymentForm.patchValue(
              { plan_id: null },
              { emitEvent: false }
            );
            this.paymentForm.get('plan_id')?.clearValidators();
            this.paymentForm
              .get('plan_id')
              ?.updateValueAndValidity({ emitEvent: false });

            this.mealTypes = this.getSelectedMealTypes(plan?.max_meals, 'Meal');
            this.snackTypes = this.getSelectedMealTypes(
              plan?.no_snacks,
              'Snack'
            );
          } else {
            const [plan] = this.paymentDetails.Programs[
              value.program_type
            ][0].plans.filter((e) => e.program_id === value.program_id);
            this.mealTypes = this.getSelectedMealTypes(
              plan?.details.max_meal,
              'Meal'
            );
            this.snackTypes = this.getSelectedMealTypes(
              plan?.details.max_snack,
              'Snack'
            );
            this.numberOfDays = this.getNumberOfDays(
              plan?.details.min_days,
              plan?.details.max_days
            );
            this.paymentForm.patchValue(
              {
                program_id: plan?.program_id,
                plan_id: plan?.id,
              },
              { emitEvent: false }
            );
          }
        }
        if (value.exchange_paymentLink) {
          if (value.exchange_paymentLink == 'yes') {
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
      }
    );

    this.valueChangesSubscription2 = this.paymentForm
      .get('program_type')
      ?.valueChanges.subscribe((res) => {
        this.paymentForm.patchValue({
          subscription_days: null,
          meal_types: null,
          snack_types: null,
        });
      });
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
      filteredData.dislike = filteredData.dislike.join(',');

      this._PaymentlinkService
        .create_payment_link(filteredData)
        .subscribe((res) => {
          if (res.status == 1) {
            this.PaymentLink = res.data;
            this.paymentForm.reset();
            this._MessageService.add({
              severity: 'success',
              summary: 'Payment Created Successfully',
              detail: 'Payment link returned',
            });
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
  onCheckboxChange(event: any, type: string) {
    let formArray: FormArray = this.paymentForm.get(type) as FormArray;

    if (event.target.checked) {
      formArray.push(new FormControl(event.target.value));
    } else {
      let i: number = 0;
      formArray.controls.forEach((ctrl: any) => {
        if (ctrl.value === event.target.value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }

    if (formArray.length > 0) {
      this.paymentForm.get(type)?.setErrors(null);
    } else {
      this.paymentForm.get(type)?.setErrors({ required: true });
    }
  }
}
