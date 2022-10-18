export interface Sensors {
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
