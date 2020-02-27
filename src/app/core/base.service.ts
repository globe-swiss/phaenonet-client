import { AlertService } from '../messaging/alert.service';

export abstract class BaseService {
  constructor(protected alertService: AlertService) {}
}
