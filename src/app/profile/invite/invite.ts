import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;

export class Invite {
  user: string;
  email: string;
  locale: string;
  register_nick?: string;
  register_user?: string;
  register_date?: Timestamp;
  sent?: Timestamp;
  resend?: any;
  created?: Timestamp;
  modified?: Timestamp;
}
