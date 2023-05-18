import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DislikeService } from 'src/app/services/dislike.service';

@Component({
  selector: 'app-add-reasons',
  templateUrl: './add-reasons.component.html',
  styleUrls: ['./add-reasons.component.scss'],
})
export class AddReasonsComponent implements OnInit {
  selectedReason: string = '';
  constructor(private _DislikeService: DislikeService,private _Router:Router, private route:ActivatedRoute) {}

  ngOnInit(): void {}

  addReason(reason: string) {
    if (reason != '') {
      this._DislikeService.addReasons(reason).subscribe({ next: (res) => {
        this._Router.navigate(['../reasons'], { relativeTo: this.route })
      } });
    }
  }
}
