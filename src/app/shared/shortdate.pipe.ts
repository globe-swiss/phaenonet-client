import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { formatShortDate } from './formatDate';

@Pipe({
  name: 'shortdate'
})
export class ShortdatePipe implements PipeTransform {
  transform(value: Timestamp, ...args: unknown[]): unknown {
    try {
      return formatShortDate(value.toDate());
    } catch (error) {
      return value;
    }
  }
}
