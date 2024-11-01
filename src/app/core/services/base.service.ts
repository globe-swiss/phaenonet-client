import { AlertService } from '@shared/services/alert.service';

export abstract class BaseService {
  constructor(protected alertService: AlertService) {}
}
