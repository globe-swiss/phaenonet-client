import { TenantType } from './tenant-type';
import { MasterdataLike } from './masterdata-like';

export class Species implements MasterdataLike {
  id: string;
  de: string;
  tenant: TenantType;
}
