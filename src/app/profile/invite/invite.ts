import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export class Invite {
  user: string;
  email: string;
  locale: string;
  register_nick?: string;
  register_user?: string;
  register_date?: Timestamp;
  sent?: Timestamp;
  created?: Timestamp;
  modified?: Timestamp;
}
