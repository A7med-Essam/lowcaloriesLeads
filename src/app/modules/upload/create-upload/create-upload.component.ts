import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-create-upload',
  templateUrl: './create-upload.component.html',
  styleUrls: ['./create-upload.component.scss'],
})
export class CreateUploadComponent implements OnInit {
  insertForm!: FormGroup;

  constructor(private _UploadService: UploadService, private _Router: Router) {}

  ngOnInit(): void {
    this.getInsertForm();
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      this._UploadService.createFile(form.value).subscribe((res) => {
        this._Router.navigate(['upload/show']);
        this.insertForm.reset();
      });
    }
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      file: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
    });
  }

  uploadFile() {
    let input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.multiple = true;
    input.click();
    input.onchange = (e) => {
      this.onFileChange(e);
    };
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
          const base64Strings = await Promise.all(
            Array.from(files).map(readFile)
          );

          let type:string = "";
          const [file] = base64Strings.map((base64String: any) => {
            type = base64String.split(',')[0].split(':')[1].split(';')[0];
            return base64String;
          });

          this.insertForm.patchValue({
            file,
            type:type.split("/")[0],
          });
        } catch (error) {
          console.error(error);
        }
      };

      readFiles();
    }
  }
}
