import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipaTmdbSlika',
})
export class PipaTmdbSlikaPipe implements PipeTransform {
  transform(value?: string): string {
    if (value == undefined) {
      return '/assets/nema-slike.png';
    }

    return `https://image.tmdb.org/t/p/original${value}`;
  }
}
