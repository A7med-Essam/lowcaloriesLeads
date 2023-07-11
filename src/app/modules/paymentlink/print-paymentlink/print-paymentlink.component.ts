import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { Subscription } from 'rxjs';
import {
  PaymentDetails,
  PaymentlinkService,
  Programs,
} from 'src/app/services/paymentlink.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-print-paymentlink',
  templateUrl: './print-paymentlink.component.html',
  styleUrls: ['./print-paymentlink.component.scss'],
})
export class PrintPaymentlinkComponent implements OnInit, OnDestroy {
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
      bag: new FormControl(null, [Validators.required]),
      cutlery: new FormControl(null, [Validators.required]),
      dislike: new FormArray([]),
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
      this._PaymentlinkService.print_payment_link(filteredData).subscribe({
        next: (res) => {
          if (res.status == 1) {
            this.print(res.data)
            this.creatingStatus = false;
            this.paymentForm.reset();
            this.createPaymentForm();
            this.uncheckAllCheckboxes();
            this._MessageService.add({
              severity: 'success',
              summary: 'Payment Link',
              detail: res.message,
            });
          } else {
            this.creatingStatus = false;
            this.paymentForm.patchValue({
              start_date: new Date(filteredData.start_date),
              birthday: new Date(filteredData.birthday),
            });
          }
        },
        error: (err) => {
          this.creatingStatus = false;
          this.paymentForm.patchValue({
            start_date: new Date(filteredData.start_date),
            birthday: new Date(filteredData.birthday),
          });
        },
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
  }

  print(res: any) {
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    const imageFile = '../../../../assets/images/logo.png';
    doc.addImage(imageFile, 'JPEG', 10, 10, 20, 15);
    doc.setTextColor(50);
    doc.setFontSize(10);
    doc.text(`Issue Date:${new Date().toLocaleDateString('en-CA')}`, 10, 35);
    doc.text('Issue Subject:Payment Link Report', 10, 40);
    doc.text('Prepared By: Low Calories Technical Team', 10, 45);
    doc.text('Requested By: Mohamed Fawzy', 10, 50);
    doc.text('Low Calories Restaurant - Egypt', 150, 30);
    doc.text('3rd Settelment, New Cairo', 150, 35);
    doc.text('Phone: 201116202225', 150, 40);
    doc.text('Email: info@thelowcalories.com', 150, 45);
    doc.text('Website: thelowcalories.com', 150, 50);

    autoTable(doc, { startY: 55 });

    var columns = [
      // { title: 'Date', dataKey: res.created_at.substring(0, 10) },
      { title: 'user_id', dataKey: res.user_id },
      { title: 'mode', dataKey: res.mode },
      { title: 'program_id', dataKey: res.program_id },
      { title: 'deleted', dataKey: res.deleted },
      { title: 'sub_from', dataKey: res.sub_from },
      { title: 'code_id', dataKey: res.code_id },
      { title: 'location_id', dataKey: res.location_id },
      { title: 'price', dataKey: res.price },
      { title: 'total_price', dataKey: res.total_price },
      { title: 'branch', dataKey: res.branch },
      { title: 'bag', dataKey: res.bag },
      { title: 'agent_id', dataKey: res.agent_id },
      { title: 'cutlery', dataKey: res.cutlery },
      { title: 'delivery_starting_day', dataKey: res.delivery_starting_day },
      { title: 'days_of_week', dataKey: res.days_of_week },
      { title: 'dislike', dataKey: res.dislike },
      { title: 'note', dataKey: res.note },
      { title: 'dis_like_user', dataKey: res.dis_like_user },
      { title: 'subscriptions_note', dataKey: res.subscriptions_note },
      { title: 'full_plan_name', dataKey: res.full_plan_name },
      { title: 'id', dataKey: res.id },
      { title: 'invoice_no', dataKey: res.invoice_no },
    ];

    // doc.text(140, 40, "Report");
    autoTable(doc, { body: columns });

    // Set the line color and width
    doc.setDrawColor(0, 0, 0); // RGB color values (black in this case)
    doc.setLineWidth(0.5); // Line width in mm (adjust as needed)

    // Draw a line at the bottom of the page

    // Get the total number of pages
    const totalPages = doc.internal.pages;

    // Iterate over each page and add the footer
    for (let i = 1; i <= totalPages.length; i++) {
      doc.line(
        20,
        doc.internal.pageSize.height - 20,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 20
      );
      // Set the current page as active
      doc.setPage(i);
      // Set the position and alignment of the footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        'Thelowcalories.com',
        20,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save('dislike.pdf');
  }
}

// {
//   "user_id": 26463,
//   "mode": 2,
//   "program_id": 50,
//   "deleted": 0,
//   "sub_from": "Branch",
//   "code_id": 1,
//   "location_id": 47379,
//   "price": 0,
//   "total_price": 50,
//   "branch": "yes",
//   "bag": 50,
//   "agent_id": 1000,
//   "cutlery": "checked",
//   "delivery_starting_day": "2023-07-31",
//   "days_of_week": "\"Sat\"",
//   "dislike": "[\"Meal 1\"]",
//   "note": null,
//   "dis_like_user": null,
//   "subscriptions_note": "1M-VEG-7-1DD",
//   "full_plan_name": "1Meal-VEGAN DIET-7Days-1Delivery Days",
//   "id": 48003,
//   "invoice_no": "CH-20230711-164216-50"
// }
