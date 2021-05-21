import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/app';
import { formatShortDateTime } from './formatDate';
import Timestamp = firebase.firestore.Timestamp;

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
