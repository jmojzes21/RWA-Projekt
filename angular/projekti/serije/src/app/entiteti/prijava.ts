import { TipKorisnika } from './korisnik';

export type TipStatusPrijave = 'gotovo' | 'totp';

export interface IPrijavaOdgovor {
  status: TipStatusPrijave;

  korisnicko_ime?: string;
  tip_korisnika?: TipKorisnika;
}
