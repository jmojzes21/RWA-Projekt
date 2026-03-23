import { Component, OnInit } from '@angular/core';
import { RestService } from '../../servisi/rest.service';
import { Greska } from '../../entiteti/greske';
import { Korisnik, SpolKorisnika } from '../../entiteti/korisnik';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { formatirajDatum, formatirajDatumRest, parsirajDatum } from '../../servisi/datumi';
import { RecaptchaService } from '../../servisi/recaptcha.service';
import { TotpPodaci } from '../../entiteti/totp';
import { Poruka } from '../../entiteti/poruka';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss',
})
export class ProfilComponent implements OnInit {
  public korisnik?: Korisnik;

  public korisnicko_ime: string = '';
  public email: string = '';

  public ime: string = '';
  public prezime: string = '';
  public datum_rodenja: string = '';
  public najdraza_zivotinja: string = '';
  public spol?: SpolKorisnika = undefined;

  public totp_podaci?: TotpPodaci = undefined;
  public qrSadrzaj?: string = undefined;

  public poruka?: Poruka = undefined;

  constructor(private restServis: RestService, private recaptchaServis: RecaptchaService, private autentifikacijaServis: AutentifikacijaService) {}

  public async pohraniPromjene() {
    let tijelo: any = {};

    try {
      let datum_rodenja = undefined;

      if (this.datum_rodenja != '') {
        datum_rodenja = parsirajDatum(this.datum_rodenja);
        if (datum_rodenja == undefined) throw 'Pogrešan format datuma rođenja';

        tijelo.datum_rodenja = formatirajDatumRest(datum_rodenja);
      }

      tijelo.ime = this.ime;
      tijelo.prezime = this.prezime;
      tijelo.spol = this.spol;
      tijelo.najdraza_zivotinja = this.najdraza_zivotinja;

      let token = await this.recaptchaServis.izvrsi('azuriranje_profila');
      tijelo.recaptchaToken = token;

      let odgovor = await this.restServis.putResurs(`/baza/korisnici/${this.korisnik!.korisnicko_ime}`, {
        trazeni_kod: 201,
        tijelo: tijelo,
      });

      await this.dohvatiPodatke(this.korisnik!.korisnicko_ime);

      this.poruka = Poruka.uspjeh('Podaci su uspješno pohranjeni');
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(greska.poruka);
    }
  }

  public async ukljuciDvorazinskuAutentifikaciju() {
    try {
      let token = await this.recaptchaServis.izvrsi('azuriranje_profila');

      let odgovor = (await this.restServis.postResurs(`/baza/korisnici/${this.korisnik!.korisnicko_ime}/2fa_auth`, {
        trazeni_kod: 201,
        tijelo: {
          totp_ukljuceno: true,
          recaptchaToken: token,
        },
      })) as { totp_podaci?: TotpPodaci };

      this.totp_podaci = odgovor.totp_podaci;

      if (this.totp_podaci != undefined) {
        let qrSadrzaj = this.autentifikacijaServis.generirajTotpSadrzajZaQrKod(this.korisnik!.korisnicko_ime, this.totp_podaci);
        this.qrSadrzaj = qrSadrzaj;
      }

      await this.dohvatiPodatke(this.korisnik!.korisnicko_ime);

      this.poruka = Poruka.uspjeh('Dvorazinska autentifikacija je uspješno uključena');
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(greska.poruka);
    }
  }

  public async iskljuciDvorazinskuAutentifikaciju() {
    try {
      let token = await this.recaptchaServis.izvrsi('azuriranje_profila');

      let odgovor = await this.restServis.postResurs(`/baza/korisnici/${this.korisnik!.korisnicko_ime}/2fa_auth`, {
        trazeni_kod: 201,
        tijelo: {
          totp_ukljuceno: false,
          recaptchaToken: token,
        },
      });

      await this.dohvatiPodatke(this.korisnik!.korisnicko_ime);
      this.totp_podaci = undefined;
      this.qrSadrzaj = undefined;

      this.poruka = Poruka.uspjeh('Dvorazinska autentifikacija je uspješno isključena');
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(greska.poruka);
    }
  }

  public async ngOnInit() {
    let prijavljeniKorisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();

    if (prijavljeniKorisnik != undefined) {
      this.dohvatiPodatke(prijavljeniKorisnik?.korisnicko_ime);
    }
  }

  private async dohvatiPodatke(korisnicko_ime: string) {
    try {
      let podaci = (await this.restServis.getResurs(`/baza/korisnici/${korisnicko_ime}`)) as Korisnik;

      this.prikaziPodatke(podaci);
    } catch (nesto) {
      let greska = Greska.od(nesto);

      this.poruka = Poruka.greska(`Dohvat podataka nije uspio\nPoruka: ${greska.poruka}`);
    }
  }

  private prikaziPodatke(korisnik: Korisnik) {
    this.korisnik = korisnik;

    this.korisnicko_ime = korisnik.korisnicko_ime;
    this.email = korisnik.email;

    this.ime = korisnik.ime ?? '';
    this.prezime = korisnik.prezime ?? '';
    this.spol = korisnik.spol;

    if (korisnik.datum_rodenja != undefined) {
      this.datum_rodenja = formatirajDatum(new Date(korisnik.datum_rodenja));
    }

    this.najdraza_zivotinja = korisnik.najdraza_zivotinja ?? '';
  }
}
