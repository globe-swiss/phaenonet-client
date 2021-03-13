import * as moment from 'moment';

export function formatShortDate(date: Date): string {
  return moment(date).format(moment.localeData().longDateFormat('L'));
}

export function formatShortDateTime(date: Date): string {
  const mDate = moment(date);
  return (
    mDate.format(moment.localeData().longDateFormat('L')) +
    ' ' +
    mDate.format(moment.localeData().longDateFormat('LTS'))
  );
}
