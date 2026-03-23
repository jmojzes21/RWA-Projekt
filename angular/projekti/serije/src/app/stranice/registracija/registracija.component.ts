import { Component } from '@angular/core';
import { SpolKorisnika, TipKorisnika } from '../../entiteti/korisnik';
import { Greska } from '../../entiteti/greske';
import { formatirajDatumRest, parsirajDatum } from '../../servisi/datumi';
import { RestService } from '../../servisi/rest.service';
import { RecaptchaService } from '../../servisi/recaptcha.service';
import { Poruka } from '../../entiteti/poruka';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrl: './registracija.component.scss',
})
export class RegistracijaComponent {
  public korisnicko_ime: string = '';
  public email: string = '';
  public lozinka: string = '';

  public ime: string = '';
  public prezime: string = '';
  public datum_rodenja: string = '';
  public najdraza_zivotinja: string = '';
  public spol?: SpolKorisnika = undefined;

  public tip_korisnika: TipKorisnika = 'obican';
  public poruka?: Poruka = undefined;

  constructor(private restServis: RestService, private recaptchaServis: RecaptchaService) {}

  public async registrirajKorisnika() {
    let tijelo: any = {};

    try {
      this.provjeriUnos();

      let datum_rodenja = undefined;

      if (this.datum_rodenja != '') {
        datum_rodenja = parsirajDatum(this.datum_rodenja);
        if (datum_rodenja == undefined) throw 'Pogrešan format datuma rođenja';

        tijelo.datum_rodenja = formatirajDatumRest(datum_rodenja);
      }

      (tijelo.korisnicko_ime = this.korisnicko_ime), (tijelo.email = this.email);
      tijelo.lozinka = this.lozinka;

      tijelo.ime = this.ime;
      tijelo.prezime = this.prezime;
      tijelo.spol = this.spol;

      tijelo.najdraza_zivotinja = this.najdraza_zivotinja;
      tijelo.tip_korisnika = this.tip_korisnika;
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(greska.poruka);
      return;
    }

    try {
      let token = await this.recaptchaServis.izvrsi('registracija');
      tijelo.recaptchaToken = token;

      let odgovor = await this.restServis.postResurs('/baza/korisnici/', {
        trazeni_kod: 201,
        tijelo: tijelo,
      });

      this.ocistiUnos();
      this.poruka = Poruka.uspjeh('Korisnik je uspješno registriran');
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(`Registracija korisnika nije uspjela\nPoruka: ${greska.poruka}`);
    }
  }

  public ocistiUnos() {
    this.korisnicko_ime = '';
    this.email = '';
    this.lozinka = '';

    this.ime = '';
    this.prezime = '';
    this.datum_rodenja = '';
    this.najdraza_zivotinja = '';
    this.spol = undefined;

    this.tip_korisnika = 'obican';
  }

  private provjeriUnos() {
    if (this.korisnicko_ime == '') {
      throw 'Unesite korisničko ime';
    }

    if (this.email == '') {
      throw 'Unesite email';
    }

    let emailReg = /^(\w+)(\.\w+)*\@(\w+)(\.\w+)*$/gm;
    if (emailReg.test(this.email) == false) {
      throw 'Email nije valjan';
    }

    if (this.lozinka == '') {
      throw 'Unesite lozinku';
    }

    if (this.tip_korisnika == undefined) {
      throw 'Odaberite tip korisnika';
    }
  }
}
