export type HttpVrstaZahtjeva = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface IStranicaZapisa {
  stranica: number;
  zapisi: Zapis[];
  ukupnoStranica: number;
  ukupnoRezultata: number;
}

export class Zapis {
  public vrijeme: string = '';
  public korisnicko_ime: string = '';

  public vrsta_zahtjeva: HttpVrstaZahtjeva = 'GET';
  public trazeni_resurs: string = '';

  public tijelo?: string = undefined;
}
