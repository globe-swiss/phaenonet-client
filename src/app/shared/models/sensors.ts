export interface SensorDataInternal {
  ahs: number; // air humidity
  ats: number; // air temperature
  shs: number; // soil humidity
  sts: number; // soil temperature
  n: number; // number of measurements fot this day
}

export interface DailySensorData {
  airHumidity: number;
  airTemperature: number;
  soilHumidity: number;
  soilTemperature: number;
  day: Date;
}

/**
 * Database representation
 */
export interface Sensors {
  data: { [name: string]: SensorDataInternal };
  year: number;
}
