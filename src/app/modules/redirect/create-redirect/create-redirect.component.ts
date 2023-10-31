import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RedirectService } from 'src/app/services/redirect.service';

@Component({
  selector: 'app-create-redirect',
  templateUrl: './create-redirect.component.html',
  styleUrls: ['./create-redirect.component.scss'],
})
export class CreateRedirectComponent implements OnInit {
  insertForm!: FormGroup;
  constructor(
    private _Router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _RedirectService: RedirectService,
  ) {}

  ngOnInit(): void {
    this.getInsertForm();
  }

  insertRow(form: FormGroup) {
    if (form.valid) {
      this._RedirectService.createRedirectLinks(form.value).subscribe((res) => {
        this._Router.navigate(['redirect/show'], {
          relativeTo: this._ActivatedRoute.parent?.parent,
        });
        this.insertForm.reset();
      });
    }
  }

  getInsertForm() {
    this.insertForm = new FormGroup({
      url: new FormControl(null, [Validators.required]),
      redirect_url: new FormControl(null, [Validators.required]),
    });
  }
}
