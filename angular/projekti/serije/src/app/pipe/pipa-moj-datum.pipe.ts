import { Pipe, PipeTransform } from '@angular/core';
import { formatirajDatum, formatirajDatumVrijeme, formatirajVrijeme } from '../servisi/datumi';

@Pipe({
  name: 'pipaMojDatum',
})
export class PipaMojDatumPipe implements PipeTransform {
  transform(value?: string, nacin: 'datum' | 'datumVrijeme' | 'vrijeme' = 'datum'): string | undefined {
    if (value == undefined) return undefined;

    if (nacin == 'datum') {
      return formatirajDatum(new Date(value));
    } else if (nacin == 'vrijeme') {
      return formatirajVrijeme(new Date(value));
    } else {
      return formatirajDatumVrijeme(new Date(value));
    }
  }
}
