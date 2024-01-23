import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  isSidebarPinned = false;
  isSidebarToggeled = false;

  // private dataSubject = new BehaviorSubject<any>(null);
  // public data$ = this.dataSubject.asObservable();

  // setData(data: any): void {
  //   this.dataSubject.next(data);
  // }

  constructor() {}

  toggleSidebar() {
    this.isSidebarToggeled = !this.isSidebarToggeled;
  }

  toggleSidebarPin() {
    this.isSidebarPinned = !this.isSidebarPinned;
  }

  getSidebarStat() {
    return {
      isSidebarPinned: this.isSidebarPinned,
      isSidebarToggeled: this.isSidebarToggeled,
    };
  }

  getFormData(object: any) {
    const formData = new FormData();
    Object.keys(object).forEach((key) => formData.append(key, object[key]));
    return formData;
  }

  getDateTime(currentDate: any) {
    if (currentDate) {
      let date = new Date(currentDate);
      let yr = date.getFullYear();
      let mo = date.getMonth() + 1;
      let day = date.getDate();
      let hours = date.getHours();
      let hr = hours < 10 ? '0' + hours : hours;
      let minutes = date.getMinutes();
      let min = minutes < 10 ? '0' + minutes : minutes;
      let seconds = date.getSeconds();
      let sec = seconds < 10 ? '0' + seconds : seconds;
      let newDateString =
        yr +
        '-' +
        (mo.toString().length == 1 ? `0${mo}` : mo) +
        '-' +
        (day.toString().length == 1 ? `0${day}` : day);
      let newTimeString = hr + ':' + min + ':' + sec;
      let excelDateString = newDateString + ' ' + newTimeString;
      return excelDateString;
    } else {
      return null;
    }
  }
}
