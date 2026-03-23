import { Pipe, PipeTransform } from '@angular/core';
import { SpolKorisnika } from '../entiteti/korisnik';

@Pipe({
  name: 'pipaSpolKorisnika',
})
export class PipaSpolKorisnikaPipe implements PipeTransform {
  transform(value?: SpolKorisnika): string | undefined {
    if (value == 'Z') return 'žensko';
    else if (value == 'M') return 'muško';

    return undefined;
  }
}
