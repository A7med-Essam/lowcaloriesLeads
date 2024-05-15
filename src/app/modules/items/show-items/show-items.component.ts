import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { GuardService } from 'src/app/services/guard.service';
import { ItemService } from 'src/app/services/item.service';

@Component({
  selector: 'app-show-items',
  templateUrl: './show-items.component.html',
  styleUrls: ['./show-items.component.scss'],
})
export class ShowItemsComponent implements OnInit {
  constructor(
    private _ItemService: ItemService,
    private _ConfirmationService: ConfirmationService,
    private _GuardService: GuardService
  ) {}

  ngOnInit(): void {
    this.setCreateDislikeForm();
    this.setCreateCategoryForm();
    this.createFilterForm();
    this.setUpdateForm();
    this.getPermission();
    this.getItems();
    this.getCategories();
    this.getDislikes();
  }

  updatePermission: boolean = false;
  deletePermission: boolean = false;
  optionPermission: boolean = false;
  getPermission() {
    this.updatePermission =
      this._GuardService.getPermissionStatus('update_items');
    this.deletePermission =
      this._GuardService.getPermissionStatus('deleteFile_items');
    this.optionPermission =
      this._GuardService.getPermissionStatus('addOptions_items');
  }

  items: any[] = [];
  PaginationInfo: any;

  getItems(page: number = 1) {
    if (this.appliedFilters) {
      this.getOldFilters(page);
    } else {
      this._ItemService.getItemLowcalories(page,this.currentPaginate).subscribe({
        next: (res) => {
          this.items = res.data.data;
          this.PaginationInfo = res.data;
        },
      });
    }
  }

  currentPage: number = 1;
  currentPaginate: number = 50;
  paginate(e: any) {
    this.currentPaginate = e.rows
    this.currentPage = e.first / e.rows + 1;
    this.getItems(e.first / e.rows + 1);
  }

  cateogries: any[] = [];
  getCategories() {
    this._ItemService.getMealCategories().subscribe({
      next: (res) => (this.cateogries = res.data),
    });
  }

  dislikes: any[] = [];
  getDislikes() {
    this._ItemService.getAllDislikes().subscribe({
      next: (res) => (this.dislikes = res.data),
    });
  }

  // =============filter===================
  filterModal: boolean = false;
  appliedFilters: any = null;

  filterForm!: FormGroup;
  createFilterForm() {
    this.filterForm = new FormGroup({
      category: new FormControl(null),
      item: new FormControl(null),
      disLikes: new FormControl(null),
    });
  }

  filter(form: FormGroup) {
    for (const prop in form.value) {
      if (form?.value[prop] === null) {
        delete form?.value[prop];
      }
    }
    this.appliedFilters = form.value;
    this._ItemService.filterItems(1, form.value,this.currentPaginate).subscribe((res) => {
      this.items = res.data.data;
      this.PaginationInfo = res.data;
      this.filterModal = false;
    });
  }

  getOldFilters(page: number) {
    this._ItemService
      .filterItems(page, this.appliedFilters,this.currentPaginate)
      .subscribe((res) => {
        this.items = res.data.data;
        this.PaginationInfo = res.data;
        this.filterModal = false;
      });
  }

  resetFilter() {
    this.appliedFilters = null;
    this.filterModal = false;
    this.filterForm.reset();
    this.getItems();
  }

  resetFields() {
    this.filterForm.reset();
  }

  // ===========upload===============

  getUploadedFile(event: any) {
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
          const base64Strings = await Promise.all(
            Array.from(files).map(readFile)
          );
          const fileTypes = base64Strings.map((base64String: any) => {
            const type = base64String.split(',')[0].split(':')[1].split(';')[0];
            return { [type]: base64String };
          });
          this.updateForm.patchValue({
            files: fileTypes,
          });
        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }

  // ============ update =================
  updateModal: boolean = false;
  updateForm!: FormGroup;
  showUpdate(row: any) {
    this.updateModal = true;
    this.updateForm.patchValue({
      item_id: row.id,
      category: row?.category,
      disLikes: row?.disLikes,
      item: row?.item,
    });
  }
  setUpdateForm() {
    this.updateForm = new FormGroup({
      item_id: new FormControl(null, Validators.required),
      category: new FormControl(null),
      disLikes: new FormControl(null),
      files: new FormControl(null),
      item: new FormControl({value: null, disabled: true}),
    });
  }
  update(form: FormGroup) {
    if (form.valid) {
      this._ItemService.updateMealItem(form.value).subscribe({
        next: (res) => {
          this.getItems();
          this.updateModal = false;
        },
      });
    }
  }

  // ======================= show details ==================
  detailsModal: boolean = false;
  currentRow: any;
  showRow(row: any) {
    this.currentRow = row;
    this.detailsModal = true;
  }

  confirm(id: any) {
    this._ConfirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteRow(id);
      },
    });
  }
  confirmDislike(id: any) {
    this._ConfirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteDisLikes(id);
      },
    });
  }
  confirmCategory(id: any) {
    this._ConfirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.deleteMealCategory(id);
      },
    });
  }

  deleteMealCategory(id: number) {
    this._ItemService.deleteMealCategory(id).subscribe({
      next: (res) => {
        this.getCategories();
      },
    });
  }

  deleteDisLikes(id: number) {
    this._ItemService.deleteDisLikes(id).subscribe({
      next: (res) => {
        this.getDislikes();
      },
    });
  }

  deleteRow(id: number) {
    this._ItemService.deleteItemFile(id).subscribe({
      next: (res) => {
        this.getItems();
        this.detailsModal = false;
      },
    });
  }
  // ======================= Options ==================
  createDislikeModal: boolean = false;
  createCategoryModal: boolean = false;
  dislikeModal: boolean = false;
  categoryModal: boolean = false;
  createDislikeForm!: FormGroup;
  createCategoryForm!: FormGroup;
  setCreateDislikeForm() {
    this.createDislikeForm = new FormGroup({
      name: new FormControl(null, Validators.required),
    });
  }
  setCreateCategoryForm() {
    this.createCategoryForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      type: new FormControl('meal', Validators.required),
    });
  }
  createDislike(form: FormGroup) {
    if (form.valid) {
      this._ItemService.addDislikes(form.value).subscribe({
        next: (res) => {
          this.getDislikes();
          this.createDislikeModal = false;
          this.createDislikeForm.reset();
        },
      });
    }
  }
  createCategory(form: FormGroup) {
    if (form.valid) {
      this._ItemService.addMealCategory(form.value).subscribe({
        next: (res) => {
          this.getCategories();
          this.createCategoryModal = false;
          this.createCategoryForm.reset();
        },
      });
    }
  }
}
