import { Timestamp } from '@angular/fire/firestore';

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
