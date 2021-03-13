import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/app';
import { formatShortDate } from './formatDate';
import Timestamp = firebase.firestore.Timestamp;

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
