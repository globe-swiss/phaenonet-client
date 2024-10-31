import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { formatShortDate } from './formatDate';

@Pipe({
  name: 'shortdate',
  standalone: true
})
export class ShortdatePipe implements PipeTransform {
  transform(value: Timestamp, ..._: unknown[]): unknown {
    try {
      return formatShortDate(value.toDate());
    } catch {
      return value;
    }
  }
}
