import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
import { Subscription } from 'rxjs';
import { EnquiryService } from 'src/app/services/enquiry.service';
import {
  PaymentDetails,
  PaymentlinkService,
} from 'src/app/services/paymentlink.service';

@Component({
  selector: 'app-show-enquiry',
  templateUrl: './show-enquiry.component.html',
  styleUrls: ['./show-enquiry.component.scss'],
})
export class ShowEnquiryComponent implements OnInit, OnDestroy {
  PaymentLink!: string | undefined;
  exchangeStatus: boolean = false;
  planModal: boolean = false;
  mealTypes: string[] = [];
  snackTypes: string[] = [];
  plans: any[] = [];
  numberOfDays: any[] = [];
  paymentDetails!: PaymentDetails;
  paymentForm!: FormGroup;
  gender: string[] = ['male', 'female'];
  creatingStatus: boolean = false;
  days: { name: string; value: string }[] = [
    { name: 'Saturday', value: 'SATURDAY' },
    { name: 'Sunday', value: 'SUNDAY' },
    { name: 'Monday', value: 'MONDAY' },
    { name: 'Tuesday', value: 'TUSEDAY' },
    { name: 'Wednesday', value: 'WEDNESDAY' },
    { name: 'Thursday', value: 'THURSDAY' },
    { name: 'Friday', value: 'FRIDAY' },
  ];
  tomorrow:Date = new Date(new Date().setDate(new Date().getDate() + 2))

  valueChangesSubscription1!: Subscription | undefined;
  valueChangesSubscription2!: Subscription | undefined;
  valueChangesSubscription3!: Subscription | undefined;
  valueChangesSubscription4!: Subscription | undefined;

  ngOnDestroy() {
    if (
      this.valueChangesSubscription1 &&
      this.valueChangesSubscription2 &&
      this.valueChangesSubscription3 &&
      this.valueChangesSubscription4
    ) {
      this.valueChangesSubscription1.unsubscribe();
      this.valueChangesSubscription2.unsubscribe();
      this.valueChangesSubscription3.unsubscribe();
      this.valueChangesSubscription4.unsubscribe();
    }
  }

  constructor(
    private _PaymentlinkService: PaymentlinkService,
    private _EnquiryService: EnquiryService
  ) {}

  @ViewChildren('deliveryDaysBox')
  DeliveryCheckboxElements!: QueryList<Checkbox>;
  ngOnInit(): void {
    this.createPaymentForm();
    this.getPaymentDetails();
    this.selectAllDeliveryDays();
  }

  selectAllDeliveryDays() {
    setTimeout(() => {
      this.DeliveryCheckboxElements.forEach((checkbox: Checkbox) => {
        checkbox.updateModel(true);
      });
    }, 1);
  }

  getPaymentDetails() {
    this._PaymentlinkService.getPaymentDetails().subscribe((res) => {
      if (res.status == 1) {
        this.paymentDetails = res.data;
        this.paymentDetails.GiftCodes = this.paymentDetails.GiftCodes.filter(
          (f) => f.flag == 'Head Office'
        ).map((c) => {
          return {
            code:
              c.type == 'percentage'
                ? `${c.code} (${c.percentage}%)`
                : `${c.code} (${c.value} AED)`,
            id: c.id,
            percentage: c.percentage,
            value: c.value,
            type: c.type,
            flag: c.flag,
          };
        });
      }
    });
  }

  createPaymentForm() {
    this.paymentForm = new FormGroup({
      program_type: new FormControl(null, [Validators.required]),
      program: new FormControl(null, [Validators.required]),
      program_id: new FormControl(null, [Validators.required]),
      plan_id: new FormControl(null),
      meal_types: new FormArray([], [Validators.required]),
      snack_types: new FormArray([]),
      subscription_days: new FormControl(null, [Validators.required]),
      delivery_days: new FormArray([], [Validators.required]),
      start_date: new FormControl(null, [Validators.required]),
      code_id: new FormControl(null),
      bag: new FormControl('no', [Validators.required]),
      only_snack: new FormControl('no'),
      no_meals: new FormControl(null),
      no_snacks: new FormControl(null),
    });
    this.valueChanges();
  }

  getNumberOfDays(min: number, max: number): string[] {
    const result: string[] = [];
    for (let i = min; i <= max; i++) {
      result.push(i.toString());
    }
    // return result;
    return ['7', '14', '21', '28'];
  }

  planDetails: any;
  createPaymentLink(form: FormGroup) {
    if (form.valid) {
      this.creatingStatus = true;
      form.patchValue({
        start_date: new Date(form.value.start_date).toLocaleDateString('en-CA'),
        no_meals: form.value.meal_types.length,
        no_snacks: form.value.snack_types.length,
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

      this._EnquiryService.calculate(filteredData).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.planDetails = res.data;
            this.paymentForm.reset();
            this.createPaymentForm();
            this.uncheckAllCheckboxes();
            this.selectAllDeliveryDays();
            this.creatingStatus = false;
            this.planModal = true;
          } else {
            this.creatingStatus = false;
            this.paymentForm.patchValue({
              start_date: new Date(filteredData.start_date),
            });
          }
        },
        error: (err) => {
          this.creatingStatus = false;
          this.paymentForm.patchValue({
            start_date: new Date(filteredData.start_date),
          });
        },
      });
    }
  }

  // ====================================================================UPLOAD==========================================================================

  getSelectedMealTypes(num: number, type: string) {
    let meals = [];
    for (let i = 1; i <= num; i++) {
      meals.push(`${type} ${i}`);
    }
    return meals;
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

    const onlySnack =
      this.paymentForm.get('only_snack')?.value == 'yes' ? true : false;
    if (type != 'dislike') {
      if (onlySnack) {
        if (type == 'snack_types') {
          if (formArray.length > 0) {
            this.paymentForm.get(type)?.setErrors(null);
          } else {
            this.paymentForm.get(type)?.setErrors({ required: true });
          }
        } else {
          if (formArray.length > 0) {
            this.paymentForm.get(type)?.setErrors(null);
          } else {
            this.paymentForm.get(type)?.setErrors({ required: true });
          }
          if (
            type == 'meal_types' &&
            this.paymentForm.value.program_type == 'Chef Gourmet'
          ) {
            if (formArray.length < 2) {
              this.paymentForm.get(type)?.setErrors({ required: true });
            }
          }
        }
      } else {
        if (type != 'snack_types') {
          if (formArray.length > 0) {
            this.paymentForm.get(type)?.setErrors(null);
          } else {
            this.paymentForm.get(type)?.setErrors({ required: true });
          }
          if (
            type == 'meal_types' &&
            this.paymentForm.value.program_type == 'Chef Gourmet'
          ) {
            if (formArray.length < 2) {
              this.paymentForm.get(type)?.setErrors({ required: true });
            }
          }
        }
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

  valueChanges() {
    this.valueChangesSubscription1 = this.paymentForm
      .get('program_type')
      ?.valueChanges.subscribe((value) => {
        if (value) {
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

    this.valueChangesSubscription4 = this.paymentForm
      .get('only_snack')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.checkboxElements.forEach((checkbox: Checkbox) => {
            if (checkbox.name == 'group1') {
              checkbox.writeValue(false);
            }
          });
          if (value == 'yes') {
            this.paymentForm.removeControl('meal_types');
            this.paymentForm.get('meal_types')?.setErrors(null);
            this.paymentForm.removeControl('snack_types');
            this.paymentForm.addControl('snack_types', new FormArray([]));
            this.paymentForm.get('snack_types')?.setErrors({ required: true });
          } else {
            this.paymentForm.addControl(
              'meal_types',
              new FormArray([], [Validators.required])
            );
            this.paymentForm.removeControl('snack_types');
            this.paymentForm.addControl('snack_types', new FormArray([]));
            this.paymentForm.get('snack_types')?.setErrors(null);
          }
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
    this.checkboxElements.forEach((checkbox: Checkbox) => {
      if (checkbox.name == 'group1') {
        checkbox.writeValue(false);
      }
    });
  }

  convertDates(DeliveryDates:string[]){
    const resultArray = DeliveryDates.map(dateString => {
      const dateObject = new Date(dateString);
      const dayOfWeek = dateObject.toLocaleDateString('en-US', { weekday: 'long' });
    
      return { date: dateString, day: dayOfWeek };
    });
    return resultArray
  }
}


