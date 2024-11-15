import { SourceType } from '@shared/models/source-type.model';

export class MasterdataLike {
  id: string;
  de: string;
}

export class SortedMasterdataLike extends MasterdataLike {
  seq: number;
}

export class Comment extends SortedMasterdataLike {}
export class Description extends SortedMasterdataLike {}
export class Distance extends SortedMasterdataLike {}
export class Exposition extends SortedMasterdataLike {}
export class Forest extends SortedMasterdataLike {}
export class Habitat extends SortedMasterdataLike {}
export class Irrigation extends SortedMasterdataLike {}
export class PhenophaseGroup extends SortedMasterdataLike {}
export class Shade extends SortedMasterdataLike {}

export class Species extends MasterdataLike {
  sources: SourceType[];
}

export class Phenophase extends SortedMasterdataLike {
  description_de: string;
  group_id: string;
  comments?: string[];
}
