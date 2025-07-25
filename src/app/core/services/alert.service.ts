import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subject } from 'rxjs';

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
  messageParams: object;
  titleParams: object;
  duration: number | null;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private translateService: TranslateService) {}

  latestMessage: Subject<AlertMessage> = new Subject<AlertMessage>();

  alertMessage(untranslated: UntranslatedAlertMessage): void {
    combineLatest(
      this.translateService.get(untranslated.title, untranslated.titleParams),
      this.translateService.get(untranslated.message, untranslated.messageParams),
      (title: string, message: string) => ({ title, message })
    ).subscribe(pair => {
      this.latestMessage.next({
        level: untranslated.level,
        title: pair.title,
        message: pair.message,
        duration: untranslated.duration ?? 7000
      } as AlertMessage);
    });
  }

  infoMessage(
    title: string,
    message: string,
    duration: number | null = 3000,
    messageParams: object = {},
    titleParams: object = {}
  ): void {
    this.simpleMessage(Level.INFO, title, message, duration, messageParams, titleParams);
  }

  errorMessage(
    title: string,
    message: string,
    duration: number | null = 3000,
    messageParams: object = {},
    titleParams: object = {}
  ): void {
    this.simpleMessage(Level.ERROR, title, message, duration, messageParams, titleParams);
  }

  private simpleMessage(
    level: Level,
    title: string,
    message: string,
    duration: number | null = 3000,
    messageParams: object = {},
    titleParams: object = {}
  ): void {
    this.alertMessage({
      title: title,
      message: message,
      level: level,
      messageParams: messageParams,
      titleParams: titleParams,
      duration: duration
    } as UntranslatedAlertMessage);
  }
}
