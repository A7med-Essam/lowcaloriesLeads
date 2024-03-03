import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  data!: number;
  constructor() {
    this.data = new Date().getFullYear();
  }

  ngOnInit(): void {}
}
