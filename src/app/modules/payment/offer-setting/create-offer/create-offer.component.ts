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
  selectedFile: any;
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
    private _Router: Router,
    private _fb: FormBuilder
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
      plan_id: new FormControl(''),
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
      content_type: new FormControl(null),
      style: this._fb.group({
        offer_title: this._fb.group({
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
        }),
        offer_price: this._fb.group({
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        plan_title: this._fb.group({
          backgroundColor: ['#000000', [Validators.required]],
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
        }),
        days_count: this._fb.group({
          backgroundColor: ['#000000', [Validators.required]],
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        snacks_count: this._fb.group({
          backgroundColor: ['#000000', [Validators.required]],
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        meals_count: this._fb.group({
          backgroundColor: ['#000000', [Validators.required]],
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        remaining_days: this._fb.group({
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        show_menu_title: this._fb.group({
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
        subscribe_button: this._fb.group({
          backgroundColor: ['#000000', [Validators.required]],
          fontColor: ['#000000', [Validators.required]],
          fontWight: ['bold'],
          fontSize: [null, [Validators.required]],
          fontFamily: [null, [Validators.required]],
        }),
      }),
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
      let formData = new FormData();
      formData.append('content_url', this.selectedFile);
      Object.entries(form.value).forEach(([key, value]: any) => {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            formData.append(`${key}[]`, val);
          });
        }
        else if(typeof value == 'object') {
          formData.append(key, JSON.stringify(value));
        } 
        else {
          formData.append(key, value);
        }
      });

      // const formData = new FormData();
      // formData.append('offer', JSON.stringify(form.value));
      // formData.append('file', this.selectedFile);

      this._PaymentlinkService.updateOfferSettings(formData).subscribe({
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (
        file.type.split('/')[0] != 'video' &&
        file.type.split('/')[0] != 'image'
      ) {
        // not supported type of the file
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'This Type Of File Not Supported',
        });
      } else {
        this.selectedFile = file;
        this.paymentForm.patchValue({
          content_type: file.type.split('/')[0],
        });
      }
    }
  }
  // uploadFile() {
  //   let input: HTMLInputElement = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = '*/*';
  //   input.multiple = true;
  //   input.click();
  //   input.onchange = (e) => {
  //     this.onFileChange(e);
  //   };
  // }
  // onFileChange(event: any) {
  //   if (event.target.files && event.target.files.length) {
  //     const files = event.target.files;
  //     const readFile = (file: any) => {
  //       return new Promise((resolve, reject) => {
  //         const fileReader = new FileReader();
  //         fileReader.onload = (event: any) => resolve(event.target.result);
  //         fileReader.onerror = (error) => reject(error);
  //         fileReader.readAsDataURL(file);
  //       });
  //     };

  //     const readFiles = async () => {
  //       try {
  //         const base64Strings = await Promise.all(
  //           Array.from(files).map(readFile)
  //         );

  //         let type: string = '';
  //         const [file] = base64Strings.map((base64String: any) => {
  //           type = base64String.split(',')[0].split(':')[1].split(';')[0];
  //           return base64String;
  //         });
  //         this.paymentForm.patchValue({
  //           content_type: type.split('/')[0],
  //           content_url: file,
  //         });
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     };

  //     readFiles();
  //   }
  // }

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
