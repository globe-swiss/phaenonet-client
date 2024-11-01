import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { formatShortDateTime } from './formatDate';

@Pipe({
  name: 'shortdatetime',
  standalone: true
})
export class ShortdatetimePipe implements PipeTransform {
  transform(value: Timestamp, ..._: unknown[]): unknown {
    try {
      return formatShortDateTime(value.toDate());
    } catch {
      return value;
    }
  }
}
