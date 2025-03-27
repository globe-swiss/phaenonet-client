export interface ObsDoy {
  doy: number;
  count: number;
}

export interface ObsWoy {
  week: number;
  count: number;
}

export interface YearObsSum {
  year: number;
  value: number;
}

export interface Statistics {
  agg_obs_sum: number;
  agg_range: number;
  latitude_grp: string;
  end_year: number;
  obs_woy: ObsWoy[];
  phenophase: string;
  species: string;
  start_year: number;
  year_obs_sum: YearObsSum[];
  years: number;
}
