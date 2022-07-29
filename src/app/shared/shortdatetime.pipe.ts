import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { formatShortDateTime } from './formatDate';

@Pipe({
  name: 'shortdatetime'
})
export class ShortdatetimePipe implements PipeTransform {
  transform(value: Timestamp, ...args: unknown[]): unknown {
    try {
      return formatShortDateTime(value.toDate());
    } catch (error) {
      return value;
    }
  }
}
