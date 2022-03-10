import {Injectable} from '@angular/core';
import {NotifierService} from "angular-notifier";

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {

  private readonly notifier: NotifierService

  constructor(private notifierService: NotifierService) {
    this.notifier = notifierService;
  }

  onDefault(message: string): void {
    this.notifier.notify(Type.DEFAULT, message)
  }

  onSuccess(message: string): void {
    this.notifier.notify(Type.SUCCESS, message)
  }

  onWarning(message: string): void {
    this.notifier.notify(Type.WARNING, message)
  }

  onInfo(message: string): void {
    this.notifier.notify(Type.INFO, message)
  }

  onError(message: string): void {
    this.notifier.notify(Type.ERROR, message)
  }
}

enum Type {
  DEFAULT = 'default',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

