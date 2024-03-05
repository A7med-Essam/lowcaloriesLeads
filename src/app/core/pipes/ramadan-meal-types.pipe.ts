import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ramadanMealTypes',
})
export class RamadanMealTypesPipe implements PipeTransform {
  transform(mealType: string, isRamadan: boolean): unknown {
    // const isRamadan: boolean = program_id == 10 || program_id == 11;
    if (isRamadan) {
      switch (mealType) {
        case 'Meal 1':
          return 'Iftar';
        case 'Meal 4':
          return 'Sohor';
        default:
          return mealType;
      }
    }
    return mealType;
  }
}
