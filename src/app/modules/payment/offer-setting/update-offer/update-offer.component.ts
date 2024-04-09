import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PaymentDetails,
  PaymentlinkService,
} from 'src/app/services/paymentlink.service';

@Component({
  selector: 'app-update-offer',
  templateUrl: './update-offer.component.html',
  styleUrls: ['./update-offer.component.scss'],
})
export class UpdateOfferComponent implements OnInit, OnDestroy {
  mealTypes: string[] = [];
  snackTypes: string[] = [];
  plans: any[] = [];
  numberOfDays: any[] = [];
  paymentDetails!: PaymentDetails;
  paymentForm!: FormGroup;
  creatingStatus: boolean = false;
  isLoading: boolean = false;
  valueChangesSubscription1!: Subscription | undefined;
  valueChangesSubscription2!: Subscription | undefined;
  tomorrow: Date = new Date(new Date().setDate(new Date().getDate()));
  private unsubscribe$ = new Subject<void>();

  ngOnDestroy() {
    if (this.valueChangesSubscription1 && this.valueChangesSubscription2) {
      this.valueChangesSubscription1.unsubscribe();
      this.valueChangesSubscription2.unsubscribe();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  currentRow: any;
  constructor(
    private _PaymentlinkService: PaymentlinkService,
    private _MessageService: MessageService,
    private _Router: Router,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createPaymentForm();
    this._PaymentlinkService.offer
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res == null) {
            this._Router.navigate(['offer-settings/showOffer']);
          } else {
            this.currentRow = res;
            this.getPaymentDetails();
          }
        },
      });
  }

  getPaymentDetails() {
    this.isLoading = true;
    this._PaymentlinkService.getPaymentDetails().subscribe((res) => {
      if (res.status == 1) {
        this.paymentDetails = res.data;
        this.patchValues(this.currentRow);
        this.isLoading = false;
      }
    });
  }

  patchValues(data: any) {
    const company =
      data.program.company == 'CH' ? 'chef' : data.program.type.toLowerCase();
    const type = Object.keys(this.paymentDetails.Programs).filter((k) =>
      k.toLowerCase().includes(company)
    )[0];
    const program = this.paymentDetails.Programs[type].filter(
      (p) => p.id == data.program_id
    )[0];
    this.patchStyles(data.style);
    this.paymentForm.patchValue({
      offer_id: data.id,
      name: data.name,
      program_type: type,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      bag_option: data.bag_option,
      cutlery_option: data.cutlery_option,
      status: data.status,
      plan_price: data.plan_price,
      notes: data.notes,
      url_name: data.url_name,
      menu: data.menu,
    });
    console.log(this.paymentForm.value);
    this.handleProgramTypeChange(type);
    this.handleProgramIdChange(
      this.isCustom
        ? program.plans.filter((p) => p.id == data.plan_id)[0]
        : program
    );
    this.paymentForm.patchValue({
      program: this.isCustom
        ? program.plans.filter((p) => p.id == data.plan_id)[0]
        : program,
      program_id: data.program_id,
      plan_id: data.plan_id,
      subscription_days: data.subscription_days.toString(),
    });
    this.uncheckAllCheckboxes();
    this.selectAllDeliveryDays();
    this.valueChanges();
  }

  patchStyles(style: any) {
      this.paymentForm.patchValue({
        style: {
          offer_title: {
            fontColor: style?.offer_title?.fontColor,
            fontWight: style?.offer_title?.fontWight,
            fontSize: style?.offer_title?.fontSize,
          },
          offer_price: {
            fontColor: style?.offer_price?.fontColor,
            fontWight:  style?.offer_price?.fontWight,
            fontSize: style?.offer_price?.fontSize,
            fontFamily: style?.offer_price?.fontFamily,
          },
          plan_title: {
            backgroundColor: style?.plan_title?.backgroundColor,
            fontColor: style?.plan_title?.fontColor,
            fontWight:  style?.plan_title?.fontWight,
            fontSize: style?.plan_title?.fontSize,
          },
          days_count: {
            backgroundColor: style?.days_count?.backgroundColor,
            fontColor: style?.days_count?.fontColor,
            fontWight:  style?.days_count?.fontWight,
            fontSize: style?.days_count?.fontSize,
            fontFamily: style?.days_count?.fontFamily,
          },
          snacks_count: {
            backgroundColor: style?.snacks_count?.backgroundColor,
            fontColor: style?.snacks_count?.fontColor,
            fontWight:  style?.snacks_count?.fontWight,
            fontSize: style?.snacks_count?.fontSize,
            fontFamily: style?.snacks_count?.fontFamily,
          },
          meals_count: {
            backgroundColor: style?.meals_count?.backgroundColor,
            fontColor: style?.meals_count?.fontColor,
            fontWight:  style?.meals_count?.fontWight,
            fontSize: style?.meals_count?.fontSize,
            fontFamily: style?.meals_count?.fontFamily,
          },
          remaining_days: {
            fontColor: style?.remaining_days?.fontColor,
            fontWight:  style?.remaining_days?.fontWight,
            fontSize: style?.remaining_days?.fontSize,
            fontFamily: style?.remaining_days?.fontFamily,
          },
          show_menu_title: {
            fontColor: style?.show_menu_title?.fontColor,
            fontWight:  style?.show_menu_title?.fontWight,
            fontSize: style?.show_menu_title?.fontSize,
            fontFamily: style?.show_menu_title?.fontFamily,
          },
          subscribe_button: {
            backgroundColor: style?.subscribe_button?.backgroundColor,
            fontColor: style?.subscribe_button?.fontColor,
            fontWight:  style?.subscribe_button?.fontWight,
            fontSize: style?.subscribe_button?.fontSize,
            fontFamily: style?.subscribe_button?.fontFamily,
          },
        },
      });
  
  }

  @ViewChildren('mealTypeBoxes')
  DeliveryCheckboxElements!: QueryList<Checkbox>;
  selectAllDeliveryDays() {
    setTimeout(() => {
      this.DeliveryCheckboxElements.forEach((checkbox: Checkbox) => {
        Array.from(this.currentRow.meal_types).forEach((m) => {
          if (checkbox.value == m) {
            checkbox.updateModel(true);
          }
        });
        if (this.currentRow.snack_types) {
          Array.from(this.currentRow.snack_types).forEach((s) => {
            if (checkbox.value == s) {
              checkbox.updateModel(true);
            }
          });
        }
      });
    }, 1);
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
      offer_id: new FormControl(null, [Validators.required]),
      url_name: new FormControl(null),
      menu: new FormControl(null),
      style: this._fb.group({
        offer_title: this._fb.group({
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
        }),
        offer_price: this._fb.group({
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        plan_title: this._fb.group({
          backgroundColor: ['#09c', [Validators.required]],
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
        }),
        days_count: this._fb.group({
          backgroundColor: ['#09c', [Validators.required]],
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        snacks_count: this._fb.group({
          backgroundColor: ['#09c', [Validators.required]],
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        meals_count: this._fb.group({
          backgroundColor: ['#09c', [Validators.required]],
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        remaining_days: this._fb.group({
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        show_menu_title: this._fb.group({
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        subscribe_button: this._fb.group({
          backgroundColor: ['#09c', [Validators.required]],
          fontColor: ['#000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
      }),
    });
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
            // this.paymentForm.patchValue({
            //   start_date: new Date(filteredData.start_date),
            //   end_date: new Date(filteredData.end_date),
            // });
            this._MessageService.add({
              severity: 'success',
              summary: 'Updated Successfully',
              detail: res.message,
            });
            this._Router.navigate(['offer-settings/showOffer']);
          } else {
            this.isLoading = false;
            this.creatingStatus = false;
            this.paymentForm.patchValue({
              start_date: new Date(filteredData.start_date),
              end_date: new Date(filteredData.end_date),
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.creatingStatus = false;
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

  fonts = [
    'ABeeZee',
    'Abel',
    'Abhaya Libre',
    'Aboreto',
    'Abril Fatface',
    'Abyssinica SIL',
    'Aclonica',
    'Acme',
    'Actor',
    'Adamina',
    'Advent Pro',
    'Aguafina Script',
    'Akaya Kanadaka',
    'Akaya Telivigala',
    'Akronim',
    'Akshar',
    'Aladin',
    'Alata',
    'Alatsi',
    'Albert Sans',
    'Aldrich',
    'Alef',
    'Alegreya',
    'Alegreya SC',
    'Alegreya Sans',
    'Alegreya Sans SC',
    'Aleo',
    'Alex Brush',
    'Alexandria',
    'Alfa Slab One',
    'Alice',
    'Alike',
    'Alike Angular',
    'Alkalami',
    'Allan',
    'Allerta',
    'Allerta Stencil',
    'Allison',
    'Allura',
    'Almarai',
    'Almendra',
    'Almendra Display',
    'Almendra SC',
    'Alumni Sans',
    'Alumni Sans Collegiate One',
    'Alumni Sans Inline One',
    'Alumni Sans Pinstripe',
    'Amarante',
    'Amaranth',
    'Amatic SC',
    'Amethysta',
    'Amiko',
    'Amiri',
    'Amiri Quran',
    'Amita',
    'Anaheim',
    'Andada Pro',
    'Andika',
    'Anek Bangla',
    'Anek Devanagari',
    'Anek Gujarati',
    'Anek Gurmukhi',
    'Anek Kannada',
    'Anek Latin',
    'Anek Malayalam',
    'Anek Odia',
    'Anek Tamil',
    'Anek Telugu',
    'Angkor',
    'Annie Use Your Telescope',
    'Anonymous Pro',
    'Antic',
    'Antic Didone',
    'Antic Slab',
    'Anton',
    'Antonio',
    'Anybody',
    'Arapey',
    'Arbutus',
    'Arbutus Slab',
    'Architects Daughter',
    'Archivo',
    'Archivo Black',
    'Archivo Narrow',
    'Are You Serious',
    'Aref Ruqaa',
    'Aref Ruqaa Ink',
    'Arima',
    'Arima Madurai',
    'Arimo',
    'Arizonia',
    'Armata',
    'Arsenal',
    'Artifika',
    'Arvo',
    'Arya',
    'Asap',
    'Asap Condensed',
    'Asar',
    'Asset',
    'Assistant',
    'Astloch',
    'Asul',
    'Athiti',
    'Atkinson Hyperlegible',
    'Atma',
    'Atomic Age',
    'Aubrey',
    'Audiowide',
    'Autour One',
    'Average',
    'Average Sans',
    'Averia Gruesa Libre',
    'Averia Libre',
    'Averia Sans Libre',
    'Averia Serif Libre',
    'Azeret Mono',
    'B612',
    'B612 Mono',
    'BIZ UDGothic',
    'BIZ UDMincho',
    'BIZ UDPGothic',
    'BIZ UDPMincho',
    'Babylonica',
    'Bad Script',
    'Bahiana',
    'Bahianita',
    'Bai Jamjuree',
    'Bakbak One',
    'Ballet',
    'Baloo 2',
    'Baloo Bhai 2',
    'Baloo Bhaijaan 2',
    'Baloo Bhaina 2',
    'Baloo Chettan 2',
    'Baloo Da 2',
    'Baloo Paaji 2',
    'Baloo Tamma 2',
    'Baloo Tammudu 2',
    'Baloo Thambi 2',
    'Balsamiq Sans',
    'Balthazar',
    'Bangers',
    'Barlow',
    'Barlow Condensed',
    'Barlow Semi Condensed',
    'Barriecito',
    'Barrio',
    'Basic',
    'Baskervville',
    'Battambang',
    'Baumans',
    'Bayon',
    'Be Vietnam Pro',
    'Beau Rivage',
    'Bebas Neue',
    'Belgrano',
    'Bellefair',
    'Belleza',
    'Bellota',
    'Bellota Text',
    'BenchNine',
    'Benne',
    'Bentham',
    'Berkshire Swash',
    'Besley',
    'Beth Ellen',
    'Bevan',
    'BhuTuka Expanded One',
    'Big Shoulders Display',
    'Big Shoulders Inline Display',
    'Big Shoulders Inline Text',
    'Big Shoulders Stencil Display',
    'Big Shoulders Stencil Text',
    'Big Shoulders Text',
    'Bigelow Rules',
    'Bigshot One',
    'Bilbo',
    'Bilbo Swash Caps',
    'BioRhyme',
    'BioRhyme Expanded',
    'Birthstone',
    'Birthstone Bounce',
    'Biryani',
    'Bitter',
    'Black And White Picture',
    'Black Han Sans',
    'Black Ops One',
    'Blaka',
    'Blaka Hollow',
    'Blaka Ink',
    'Blinker',
    'Bodoni Moda',
    'Bokor',
    'Bona Nova',
    'Bonbon',
    'Bonheur Royale',
    'Boogaloo',
    'Bowlby One',
    'Bowlby One SC',
    'Brawler',
    'Bree Serif',
    'Brygada 1918',
    'Bubblegum Sans',
    'Bubbler One',
    'Buda',
    'Buenard',
    'Bungee',
    'Bungee Hairline',
    'Bungee Inline',
    'Bungee Outline',
    'Bungee Shade',
    'Bungee Spice',
    'Butcherman',
    'Butterfly Kids',
    'Cabin',
    'Cabin Condensed',
    'Cabin Sketch',
    'Caesar Dressing',
    'Cagliostro',
    'Cairo',
    'Cairo Play',
    'Caladea',
    'Calistoga',
    'Calligraffitti',
    'Cambay',
    'Cambo',
    'Candal',
    'Cantarell',
    'Cantata One',
    'Cantora One',
    'Capriola',
    'Caramel',
    'Carattere',
    'Cardo',
    'Carme',
    'Carrois Gothic',
    'Carrois Gothic SC',
    'Carter One',
    'Castoro',
    'Catamaran',
    'Caudex',
    'Caveat',
    'Caveat Brush',
    'Cedarville Cursive',
    'Ceviche One',
    'Chakra Petch',
    'Changa',
    'Changa One',
    'Chango',
    'Charis SIL',
    'Charm',
    'Charmonman',
    'Chathura',
    'Chau Philomene One',
    'Chela One',
    'Chelsea Market',
    'Chenla',
    'Cherish',
    'Cherry Cream Soda',
    'Cherry Swash',
    'Chewy',
    'Chicle',
    'Chilanka',
    'Chivo',
    'Chonburi',
    'Cinzel',
    'Cinzel Decorative',
  ];
}
