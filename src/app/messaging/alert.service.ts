import { Injectable } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Option } from 'fp-ts/lib/Option';

export enum Level {
  INFO,
  WARNING,
  ERROR
}

export class AlertMessage {
  level: Level;
  title: string;
  message: string;
  duration: number;
}

export class UntranslatedAlertMessage {
  title: string;
  message: string;
  level: Level;
  messageParams: Object;
  titleParams: Object;
  duration: Option<number>;
}

@Injectable()
export class AlertService {
  constructor(private translateService: TranslateService) {}

  latestMessage: Subject<AlertMessage> = new Subject<AlertMessage>();

  alertMessage(untranslated: UntranslatedAlertMessage): void {
    combineLatest(
      this.translateService.get(untranslated.title, untranslated.titleParams),
      this.translateService.get(untranslated.message, untranslated.messageParams),
      (title, message: string) => ({ title, message })
    ).subscribe(pair => {
      this.latestMessage.next({
        level: untranslated.level,
        title: pair.title,
        message: pair.message,
        duration: untranslated.duration.getOrElse(7000)
      } as AlertMessage);
    });
  }
}
