import * as moment from 'moment';

export interface AltitudeLimits {
  altitude_grp_1_start_day: number;
  altitude_grp_1_end_day: number;
  altitude_grp_2_start_day: number;
  altitude_grp_2_end_day: number;
  altitude_grp_3_start_day: number;
  altitude_grp_3_end_day: number;
  altitude_grp_4_start_day: number;
  altitude_grp_4_end_day: number;
  altitude_grp_5_start_day: number;
  altitude_grp_5_end_day: number;
}

export interface AltitudeLimit {
  start_day: Date;
  end_day: Date;
}

export function altitudeLimits(altitude: number, limits: AltitudeLimits): AltitudeLimit {
  let start: number;
  let end: number;

  if (altitude < 500) {
    start = limits.altitude_grp_1_start_day;
    end = limits.altitude_grp_1_end_day;
  } else if (altitude < 800) {
    start = limits.altitude_grp_2_start_day;
    end = limits.altitude_grp_2_end_day;
  } else if (altitude < 1000) {
    start = limits.altitude_grp_3_start_day;
    end = limits.altitude_grp_3_end_day;
  } else if (altitude < 1200) {
    start = limits.altitude_grp_4_start_day;
    end = limits.altitude_grp_4_end_day;
  } else {
    start = limits.altitude_grp_5_start_day;
    end = limits.altitude_grp_5_end_day;
  }

  return {
    start_day: moment()
      .dayOfYear(start)
      .toDate(),
    end_day: moment()
      .dayOfYear(end)
      .toDate()
  };
}
