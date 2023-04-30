import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dislike',
  templateUrl: './dislike.component.html',
  styleUrls: ['./dislike.component.scss']
})
export class DislikeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getCustomerInfo(){

  }

  branches:string[] = [
    "branche1",
    "branche2",
    "branche3",
    "branche4",
  ]

  Reasons:string[] = [
    "Don't like meal",
    "Allergic",
    "Don't like taste",
    "Bad Smell",
    "Perfer another meal",
  ]

  
}
