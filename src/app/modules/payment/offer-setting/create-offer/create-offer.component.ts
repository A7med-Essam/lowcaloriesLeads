import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { Subscription } from 'rxjs';
import {
  PaymentDetails,
  PaymentlinkService,
} from 'src/app/services/paymentlink.service';
@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss'],
})
export class CreateOfferComponent implements OnInit, OnDestroy {
  mealTypes: string[] = [];
  snackTypes: string[] = [];
  plans: any[] = [];
  numberOfDays: any[] = [];
  paymentDetails!: PaymentDetails;
  paymentForm!: FormGroup;
  creatingStatus: boolean = false;
  isLoading: boolean = false;
  offer: any;
  valueChangesSubscription1!: Subscription | undefined;
  valueChangesSubscription2!: Subscription | undefined;
  tomorrow: Date = new Date(new Date().setDate(new Date().getDate()));

  ngOnDestroy() {
    if (this.valueChangesSubscription1 && this.valueChangesSubscription2) {
      this.valueChangesSubscription1.unsubscribe();
      this.valueChangesSubscription2.unsubscribe();
    }
  }

  constructor(
    private _PaymentlinkService: PaymentlinkService,
    private _MessageService: MessageService,
    private _Router:Router
  ) {}

  ngOnInit(): void {
    this.createPaymentForm();
    this.getPaymentDetails();
  }

  getPaymentDetails() {
    this.isLoading = true;
    this._PaymentlinkService.getPaymentDetails().subscribe((res) => {
      if (res.status == 1) {
        this.paymentDetails = res.data;
        this.isLoading = false;
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
      start_date: new FormControl(null, [Validators.required]),
      end_date: new FormControl(null, [Validators.required]),
      bag_option: new FormControl('no', [Validators.required]),
      cutlery_option: new FormControl('no', [Validators.required]),
      status: new FormControl('active', [Validators.required]),
      plan_price: new FormControl(null, [Validators.required]),
      notes: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      url_name: new FormControl(null),
      menu: new FormControl(null),
    });
    this.valueChanges()
  }

  getNumberOfDays(min: number, max: number): string[] {
    const result: string[] = [];
    for (let i = min; i <= max; i++) {
      result.push(i.toString());
    }
    // return result;
    return ['7', '14', '21', '28'];
  }

  updateOffer(form: FormGroup) {
    if (form.valid) {
      this.isLoading = true;
      this.creatingStatus = true;
      form.patchValue({
        start_date: new Date(form.value.start_date).toLocaleDateString('en-CA'),
        end_date: new Date(form.value.end_date).toLocaleDateString('en-CA'),
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

      this._PaymentlinkService.updateOfferSettings(filteredData).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.creatingStatus = false;
            this.isLoading = false;
            this.paymentForm.reset();
            this.createPaymentForm();
            this.uncheckAllCheckboxes();
            this._MessageService.add({
              severity: 'success',
              summary: 'Updated Successfully',
              detail: res.message,
            });
            this._Router.navigate(['offer-settings/showOffer']);
          } else {
            this.creatingStatus = false;
            this.isLoading = false;
            this.paymentForm.patchValue({
              start_date: new Date(filteredData.start_date),
              end_date: new Date(filteredData.end_date),
            });
          }
        },
        error: (err) => {
          this.creatingStatus = false;
          this.isLoading = false;
          this.paymentForm.patchValue({
            start_date: new Date(filteredData.start_date),
            end_date: new Date(filteredData.end_date),
          });
        },
      });
    }
  }

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

    if (type != 'dislike') {
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
  }

  handleProgramTypeChange(value: any) {
    this.handelMealTypes();
    this.resetFormFields();
    value.toLowerCase().includes('custom')
      ? (this.isCustom = true)
      : (this.isCustom = false);
    if (this.isCustom) {
      this.plans = this.paymentDetails?.Programs[value][0].plans;
    } else {
      this.plans = this.paymentDetails?.Programs[value];
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
    this.checkboxElements?.forEach((checkbox: Checkbox) => {
      if (checkbox.name == 'group1') {
        checkbox.writeValue(false);
      }
    });
  }
}
