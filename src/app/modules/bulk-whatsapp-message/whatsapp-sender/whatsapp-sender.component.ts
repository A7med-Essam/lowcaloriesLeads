import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SendBulkWhatsappService } from 'src/app/services/sendBulkWhatsapp.service';

@Component({
  selector: 'app-whatsapp-sender',
  templateUrl: './whatsapp-sender.component.html',
  styleUrls: ['./whatsapp-sender.component.scss'],
})
export class WhatsappSenderComponent implements OnInit {
  constructor(
    private _fb: FormBuilder,
    private _SendBulkWhatsappService: SendBulkWhatsappService,
    private _Router: Router
  ) {}

  insertForm = this._fb.group({
    name: ['', Validators.required],
    mobile: ['', Validators.required],
    app_key: ['', Validators.required],
    auth_key: ['', Validators.required],
    base_url: ['', Validators.required],
  });

  ngOnInit(): void {}

  onSubmit(form: FormGroup) {
    if (form.valid) {
      this._SendBulkWhatsappService.addSenders(form.value).subscribe((res) => {
        if (res.status == 1) {
          this._Router.navigate(['bulk-whatsapp-messages/whatsapp-sender']);
        }
      });
    }
  }
}
