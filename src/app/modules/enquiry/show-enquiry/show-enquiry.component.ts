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
  mealTypes: any[] = [];
  snackTypes: any[] = [];
  plans: any[] = [];
  numberOfDays: any[] = [];
  paymentDetails!: PaymentDetails;
  inquiryForm!: FormGroup;
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
  tomorrow: Date = new Date(new Date().setDate(new Date().getDate() + 2));

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
    this.createInquiryForm();
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

  createInquiryForm() {
    this.inquiryForm = new FormGroup({
      program_type: new FormControl(null, [Validators.required]),
      program: new FormControl(null, [Validators.required]),
      program_id: new FormControl(null, [Validators.required]),
      plan_id: new FormControl(null),
      meal_types: new FormArray([], [Validators.required]),
      snack_types: new FormArray([]),

      // meal_types: new FormControl(null),
      // snack_types: new FormControl(null),
      subscription_days: new FormControl(null, [Validators.required]),
      delivery_days: new FormArray([], [Validators.required]),
      start_date: new FormControl(null, [Validators.required]),
      code_id: new FormControl(null),
      bag: new FormControl('no', [Validators.required]),
      only_snack: new FormControl('no'),
      no_meals: new FormControl(0),
      no_snacks: new FormControl(0),
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
  inquiry(form: FormGroup) {
    if (form.valid) {
      this.creatingStatus = true;
      form.patchValue({
        start_date: new Date(form.value.start_date).toLocaleDateString('en-CA'),
        // meal_types:  this.getTypes(form.value.no_meals,'meal'),
        // snack_types: this.getTypes(form.value.no_snacks,'snack'),
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
            this.inquiryForm.reset();
            this.createInquiryForm();
            this.uncheckAllCheckboxes();
            this.selectAllDeliveryDays();
            this.creatingStatus = false;
            this.planModal = true;
          } else {
            this.creatingStatus = false;
            this.inquiryForm.patchValue({
              start_date: new Date(filteredData.start_date),
            });
          }
        },
        error: (err) => {
          this.creatingStatus = false;
          this.inquiryForm.patchValue({
            start_date: new Date(filteredData.start_date),
          });
        },
      });
    }
  }

  // ====================================================================UPLOAD==========================================================================

  getSelectedMealTypes(num: number, type: string) {
    // let meals = [];
    // for (let i = 1; i <= num; i++) {
    //   meals.push(`${type} ${i}`);
    // }
    // return meals;
    let meals = [];
    for (let i = 1; i <= num; i++) {
      meals.push({ label: `${type} ${i}`, value: i });
    }
    return meals;
  }

  getTypes(num: number, type: string) {
    let meals = [];
    for (let i = 1; i <= num; i++) {
      meals.push(`${type} ${i}`);
    }
    return meals;
  }

  // ====================================================================Checkbox==========================================================================
  onCheckboxChange(event: any, type: string, value: string) {
    let formArray: FormArray = this.inquiryForm.get(type) as FormArray;
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
      this.inquiryForm.get('only_snack')?.value == 'yes' ? true : false;
    if (type != 'dislike') {
      if (onlySnack) {
        if (type == 'snack_types') {
          if (formArray.length > 0) {
            this.inquiryForm.get(type)?.setErrors(null);
          } else {
            this.inquiryForm.get(type)?.setErrors({ required: true });
          }
        } else {
          if (formArray.length > 0) {
            this.inquiryForm.get(type)?.setErrors(null);
          } else {
            this.inquiryForm.get(type)?.setErrors({ required: true });
          }
          if (
            type == 'meal_types' &&
            this.inquiryForm.value.program_type == 'Chef Gourmet'
          ) {
            if (formArray.length < 2) {
              this.inquiryForm.get(type)?.setErrors({ required: true });
            }
          }
        }
      } else {
        if (type != 'snack_types') {
          if (formArray.length > 0) {
            this.inquiryForm.get(type)?.setErrors(null);
          } else {
            this.inquiryForm.get(type)?.setErrors({ required: true });
          }
          if (
            type == 'meal_types' &&
            this.inquiryForm.value.program_type == 'Chef Gourmet'
          ) {
            if (formArray.length < 2) {
              this.inquiryForm.get(type)?.setErrors({ required: false });
              // this.inquiryForm.get(type)?.setErrors({ required: true });
            }
          }
          if (
            this.inquiryForm.value.program &&
            this.inquiryForm.value.program.shortcut_name == 'SLW'
          ) {
            if (formArray.length < 3) {
              this.inquiryForm.get(type)?.setErrors({ required: true });
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
    this.valueChangesSubscription1 = this.inquiryForm
      .get('program_type')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.handleProgramTypeChange(value);
        }
      });
    this.valueChangesSubscription2 = this.inquiryForm
      .get('program')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.handleProgramIdChange(value);
          if (
            this.inquiryForm.value.program &&
            this.inquiryForm.value.program.shortcut_name == 'SLW'
          ) {
            this.inquiryForm
              .get('snack_types')
              ?.setValidators(Validators.required);
            this.inquiryForm.get('snack_types')?.setErrors({ required: true });

            let meal_types: FormArray = this.inquiryForm.get(
              'meal_types'
            ) as FormArray;
            ['Meal 1', 'Meal 2', 'Meal 3'].forEach((m) => {
              meal_types.push(new FormControl(m));
            });
            let snack_types: FormArray = this.inquiryForm.get(
              'snack_types'
            ) as FormArray;
            snack_types.push(new FormControl('Snack 1'));

          }
        }
      });

    this.valueChangesSubscription4 = this.inquiryForm
      .get('only_snack')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.checkboxElements.forEach((checkbox: Checkbox) => {
            if (checkbox.name == 'group1') {
              checkbox.writeValue(false);
            }
          });
          if (value == 'yes') {
            this.inquiryForm.removeControl('meal_types');
            this.inquiryForm.get('meal_types')?.setErrors(null);
            this.inquiryForm.removeControl('snack_types');
            this.inquiryForm.addControl('snack_types', new FormArray([]));
            // this.inquiryForm.addControl('snack_types', new FormControl(null));
            this.inquiryForm.get('snack_types')?.setErrors({ required: true });
          } else {
            this.inquiryForm.addControl(
              'meal_types',
              new FormArray([], [Validators.required])
              // 'meal_types',
              // new FormControl(null)
            );
            this.inquiryForm.removeControl('snack_types');
            this.inquiryForm.addControl('snack_types', new FormArray([]));
            // this.inquiryForm.addControl('snack_types', new FormControl(null));
            this.inquiryForm.get('snack_types')?.setErrors(null);
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
      this.inquiryForm.patchValue({
        program_id: value.program_id,
        plan_id: value.id,
      });
    } else {
      this.inquiryForm.patchValue({ program_id: value.id });
      this.mealTypes = this.getSelectedMealTypes(value.max_meals, 'Meal');
      this.snackTypes = this.getSelectedMealTypes(value.no_snacks, 'Snack');
    }
  }

  resetFormFields() {
    this.inquiryForm.patchValue({
      program: null,
      program_id: null,
      plan_id: null,
      subscription_days: null,
    });
  }

  handelPlanId() {
    if (this.isCustom) {
      this.inquiryForm.get('plan_id')?.setValidators([Validators.required]);
    } else {
      this.inquiryForm.patchValue({ plan_id: null });
      this.inquiryForm.get('plan_id')?.clearValidators();
      this.inquiryForm
        .get('plan_id')
        ?.updateValueAndValidity({ emitEvent: false });
    }
  }

  handelMealTypes() {
    this.mealTypes = [];
    this.snackTypes = [];
    this.inquiryForm.removeControl('meal_types');
    this.inquiryForm.addControl(
      'meal_types',
      new FormArray([], [Validators.required])
    );
    // this.inquiryForm.addControl(
    //   'meal_types',
    //   new FormControl(null)
    // );
    this.inquiryForm.removeControl('snack_types');
    this.inquiryForm.addControl('snack_types', new FormArray([]));
    // this.inquiryForm.addControl('snack_types', new FormControl(null));
    this.checkboxElements.forEach((checkbox: Checkbox) => {
      if (checkbox.name == 'group1') {
        checkbox.writeValue(false);
      }
    });
  }

  convertDates(DeliveryDates: string[]) {
    const resultArray = DeliveryDates.map((dateString) => {
      const dateObject = new Date(dateString);
      const dayOfWeek = dateObject.toLocaleDateString('en-US', {
        weekday: 'long',
      });

      return { date: dateString, day: dayOfWeek };
    });
    return resultArray;
  }
}
