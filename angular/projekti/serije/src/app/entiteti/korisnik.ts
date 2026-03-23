export type TipKorisnika = 'obican' | 'github' | 'admin';
export type SpolKorisnika = 'M' | 'Z';

export class Korisnik {
  public id_korisnika: number = 0;
  public korisnicko_ime: string = '';
  public email: string = '';

  public ime?: string = undefined;
  public prezime?: string = undefined;
  public spol?: SpolKorisnika = undefined;
  public datum_rodenja?: string = undefined;
  public najdraza_zivotinja?: string = undefined;

  public tip_korisnika: TipKorisnika = 'obican';

  public totp_ukljuceno: boolean = false;
}

export class PrijavljeniKorisnik {
  public korisnicko_ime: string = '';
  public tip_korisnika: TipKorisnika = 'obican';
}
