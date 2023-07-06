import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RefundService } from 'src/app/services/refund.service';

@Component({
  selector: 'app-add-reasons',
  templateUrl: './add-reasons.component.html',
  styleUrls: ['./add-reasons.component.scss'],
})
export class AddReasonsComponent implements OnInit {
  selectedReason: string = '';
  constructor(
    private _RefundService: RefundService,
    private _Router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  addReason(reason: string) {
    if (reason != '') {
      this._RefundService.addReasons(reason).subscribe({
        next: (res) => {
          this._Router.navigate(['../reasons'], { relativeTo: this.route });
        },
      });
    }
  }
}
