import { Sezona } from './sezona';

export interface IPretrazeneSerije {
  stranica: number;
  serije: Serija[];
  ukupnoStranica: number;
  ukupnoRezultata: number;
}

export interface ILokalneSerije {
  omiljene_serije: SerijaDetalji[];
}

export class Serija {
  public tmdb_id: number = 0;
  public naziv: string = '';
  public opis: string = '';
  public slika?: string = undefined;
}

export class SerijaDetalji {
  public tmdb_id: number = 0;
  public naziv: string = '';
  public opis: string = '';
  public broj_sezona: number = 0;
  public broj_epizoda: number = 0;

  public popularnost: number = 0;
  public slika?: string = undefined;
  public homepage: string = '';

  public sezone: Sezona[] = [];
}
