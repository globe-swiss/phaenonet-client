import { AltitudeLimits } from './altitude-limits';

export class Phenophase {
  id: string;
  description_de: string;
  name_de: string;
  group_id: string;
  seq: number;
  comments: string[];
  limits: AltitudeLimits;
}
