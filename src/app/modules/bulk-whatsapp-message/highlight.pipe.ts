import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightWordsStartingWithDollar',
})
export class HighlightWordsStartingWithDollarPipe implements PipeTransform {
  transform(value: string): string {
    if (value) {
      return value.replace(/(\$[^\s]+)/g, '<span class="highlight">$1</span>');
    } else {
      return value;
    }
  }
}
