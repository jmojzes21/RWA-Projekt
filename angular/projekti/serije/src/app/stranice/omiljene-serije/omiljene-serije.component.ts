import { Component, OnInit } from '@angular/core';
import { RestService } from '../../servisi/rest.service';
import { Router } from '@angular/router';
import { Greska } from '../../entiteti/greske';
import { SerijaDetalji } from '../../entiteti/serija';
import { SerijeLokalnoService } from '../../servisi/serije-lokalno.service';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';

@Component({
  selector: 'app-omiljene-serije',
  templateUrl: './omiljene-serije.component.html',
  styleUrl: './omiljene-serije.component.scss',
})
export class OmiljeneSerijeComponent implements OnInit {
  public serije: SerijaDetalji[] = [];

  constructor(
    private autentifikacijaServis: AutentifikacijaService,
    private restServis: RestService,
    private lokalneSerijeServis: SerijeLokalnoService,
    private ruter: Router,
  ) {}

  public prikaziDetalje(id: number) {
    this.ruter.navigate(['detalji_serije'], {
      queryParams: {
        id: id,
        omiljena: 'da',
      },
    });
  }

  private async dohvatiOmiljene() {
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();
    if (korisnik?.tip_korisnika == 'github') {
      this.dohvatiOmiljeneLokalno();
    } else {
      this.dohvatiOmiljeneBaza();
    }
  }

  public ngOnInit() {
    this.dohvatiOmiljene();
  }

  private async dohvatiOmiljeneBaza() {
    try {
      let odgovor = (await this.restServis.getResurs('/baza/favoriti')) as SerijaDetalji[];

      this.serije = odgovor;
    } catch (nesto) {
      let greska = Greska.od(nesto);
    }
  }

  private async dohvatiOmiljeneLokalno() {
    this.serije = await this.lokalneSerijeServis.dajOmiljeneSerije();
  }
}
