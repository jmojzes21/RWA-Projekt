import { Injectable } from '@angular/core';
import { PrijavljeniKorisnik, TipKorisnika } from '../entiteti/korisnik';
import { RestService } from './rest.service';
import { TotpPodaci } from '../entiteti/totp';
import { IPrijavaOdgovor, TipStatusPrijave } from '../entiteti/prijava';

@Injectable({
  providedIn: 'root',
})
export class AutentifikacijaService {
  private dohvacenKorisnik = false;

  constructor(private restServis: RestService) {}

  public async dohvatiPrijavljenogKorisnika(): Promise<PrijavljeniKorisnik | undefined> {
    if (this.dohvacenKorisnik) {
      return this.dajPrijavljenogKorisnika();
    }

    let korisnik = (await this.restServis.getResurs('/trenutni_korisnik', {
      potreban_jwt: false,
    })) as PrijavljeniKorisnik | undefined;

    this.dohvacenKorisnik = true;

    if (korisnik == undefined) {
      sessionStorage.removeItem('korisnicko_ime');
      sessionStorage.removeItem('tip_korisnika');
      return undefined;
    }

    sessionStorage.setItem('korisnicko_ime', korisnik.korisnicko_ime);
    sessionStorage.setItem('tip_korisnika', korisnik.tip_korisnika);

    return {
      korisnicko_ime: korisnik.korisnicko_ime,
      tip_korisnika: korisnik.tip_korisnika as TipKorisnika,
    };
  }

  public dajPrijavljenogKorisnika(): PrijavljeniKorisnik | undefined {
    let korisnicko_ime = sessionStorage.getItem('korisnicko_ime');
    let tip_korisnika = sessionStorage.getItem('tip_korisnika');

    if (korisnicko_ime == undefined || tip_korisnika == undefined) {
      return undefined;
    }

    return {
      korisnicko_ime: korisnicko_ime,
      tip_korisnika: tip_korisnika as TipKorisnika,
    };
  }

  public async prijaviSe(korisnicko_ime: string, lozinka: string, recaptchaToken: string): Promise<TipStatusPrijave> {
    let odgovor = (await this.restServis.postResurs(`/baza/korisnici/${korisnicko_ime}/prijava`, {
      trazeni_kod: 201,
      potreban_jwt: false,
      tijelo: {
        korisnicko_ime: korisnicko_ime,
        lozinka: lozinka,
        recaptchaToken: recaptchaToken,
      },
    })) as IPrijavaOdgovor;

    if (odgovor.status == 'totp') {
      return 'totp';
    }

    sessionStorage.setItem('korisnicko_ime', odgovor.korisnicko_ime!);
    sessionStorage.setItem('tip_korisnika', odgovor.tip_korisnika!);
    return 'gotovo';
  }

  public async prijavaTotp(korisnicko_ime: string, totp_kod: string) {
    let odgovor = (await this.restServis.postResurs(`/baza/korisnici/${korisnicko_ime}/totp_prijava`, {
      trazeni_kod: 201,
      potreban_jwt: false,
      tijelo: {
        kod: totp_kod,
      },
    })) as IPrijavaOdgovor;

    sessionStorage.setItem('korisnicko_ime', odgovor.korisnicko_ime!);
    sessionStorage.setItem('tip_korisnika', odgovor.tip_korisnika!);
  }

  public async odjaviSe() {
    sessionStorage.removeItem('korisnicko_ime');
    sessionStorage.removeItem('tip_korisnika');

    await this.restServis.postResurs('/odjava', {
      potreban_jwt: false,
      trazeni_kod: 201,
    });
  }

  public generirajTotpSadrzajZaQrKod(korisnicko_ime: string, totp_podaci: TotpPodaci): string {
    let izdavatelj = 'RWA Serije';
    let oznaka = encodeURI(`${izdavatelj}:${korisnicko_ime}`);

    let sadrzaj = `otpauth://totp/${oznaka}?secret=${totp_podaci.kljuc}`;
    sadrzaj += `&issuer=${encodeURI(izdavatelj)}`;
    sadrzaj += `&algorithm=${totp_podaci.algoritam.replace('-', '')}`;
    sadrzaj += `&digits=${totp_podaci.znamenke}`;
    sadrzaj += `&period=${totp_podaci.period}`;

    return sadrzaj;
  }
}
