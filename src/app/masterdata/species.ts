import { MasterdataLike } from './masterdata-like';
import { TenantType } from './tenant-type';

export class Species implements MasterdataLike {
  id: string;
  de: string;
  tenant: TenantType;
}
