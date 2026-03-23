import { Component } from '@angular/core';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { Greska } from '../../entiteti/greske';
import { RestService } from '../../servisi/rest.service';
import { Router } from '@angular/router';
import { RecaptchaService } from '../../servisi/recaptcha.service';
import { Poruka } from '../../entiteti/poruka';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrl: './prijava.component.scss',
})
export class PrijavaComponent {
  public pogled: 'prijava' | 'totp' = 'prijava';

  public korisnicko_ime: string = '';
  public lozinka: string = '';
  public totp_kod: string = '';

  public poruka?: Poruka = undefined;

  constructor(
    private autentifikacijaServis: AutentifikacijaService,
    private restServis: RestService,
    private recaptchaServis: RecaptchaService,
    private ruter: Router,
  ) {}

  public async prijaviSe() {
    try {
      this.provjeriUnos();
    } catch (g: any) {
      let greska = Greska.od(g);
      this.poruka = Poruka.greska(greska.poruka);
      return;
    }

    try {
      let token = await this.recaptchaServis.izvrsi('prijava');
      let status = await this.autentifikacijaServis.prijaviSe(this.korisnicko_ime, this.lozinka, token);

      if (status == 'gotovo') {
        this.ruter.navigateByUrl('/');
      } else if (status == 'totp') {
        this.poruka = undefined;
        this.pogled = 'totp';
      }
    } catch (g: any) {
      let greska = Greska.od(g);
      this.poruka = Poruka.greska(greska.poruka);
    }
  }

  public async githubPrijava() {
    let odgovor = await this.restServis.getResurs('/github_prijava', {
      potreban_jwt: false,
    });

    location.href = odgovor.url;
  }

  public async prijaviSeTotp() {
    try {
      let totp_kod = this.totp_kod.trim();
      if (totp_kod == '') {
        this.poruka = Poruka.greska('Unesite TOTP kod');
        return;
      }

      await this.autentifikacijaServis.prijavaTotp(this.korisnicko_ime, totp_kod);
      this.ruter.navigateByUrl('/');
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(greska.poruka);
    }
  }

  public odustaniTotpPrijava() {
    this.autentifikacijaServis.odjaviSe();
    this.korisnicko_ime = '';
    this.lozinka = '';
    this.poruka = undefined;
    this.pogled = 'prijava';
  }

  private provjeriUnos() {
    this.korisnicko_ime = this.korisnicko_ime.trim();
    this.lozinka = this.lozinka.trim();

    if (this.korisnicko_ime == '') {
      throw 'Unesite korisničko ime';
    }

    if (this.lozinka == '') {
      throw 'Unesite lozinku';
    }
  }
}
