import { Pipe, PipeTransform } from '@angular/core';
import { DataRequests } from 'src/app/services/reportStatics.service';

@Pipe({ name: 'filterData' })
export class FilterData implements PipeTransform {
  transform(data: DataRequests[], model: string = 'Total') {
    if (data == undefined) {
      return [];
    } else {
      if (model == 'totalSubscribe') {
        return data.filter((item) => {
          return item.subscribed == 1;
        });
      } else if (model == 'totalUnSubscribe') {
        return data.filter((item) => {
          return item.subscribed == 0;
        });
      } else {
        return data;
      }
    }
  }
}
