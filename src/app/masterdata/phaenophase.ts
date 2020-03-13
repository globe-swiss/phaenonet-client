import { AltitudeLimits } from './AltitudeLimits';

export class Phenophase {
  id: string;
  description_de: string;
  name_de: string;
  group_id: string;
  seq: number;
  comments: string[];
  limits: AltitudeLimits;
}
