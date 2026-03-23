import { Component, Input, OnInit } from '@angular/core';
import { RestService } from '../../servisi/rest.service';
import { SerijaDetalji } from '../../entiteti/serija';
import { Greska } from '../../entiteti/greske';
import { ActivatedRoute, Router } from '@angular/router';
import { SerijeLokalnoService } from '../../servisi/serije-lokalno.service';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { Poruka } from '../../entiteti/poruka';

@Component({
  selector: 'app-detalji-serije',
  templateUrl: './detalji-serije.component.html',
  styleUrl: './detalji-serije.component.scss',
})
export class DetaljiSerijeComponent implements OnInit {
  @Input()
  public serija?: SerijaDetalji;

  public omiljena: boolean = false;
  public poruka?: Poruka = undefined;

  constructor(
    private autentifikacijaServis: AutentifikacijaService,
    private restServis: RestService,
    private lokalneSerijeServis: SerijeLokalnoService,
    private ruta: ActivatedRoute,
    private ruter: Router,
  ) {}

  public async spremiUOmiljene() {
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();
    if (korisnik?.tip_korisnika == 'github') {
      this.spremiUOmiljeneLokalno();
    } else {
      this.spremiUOmiljeneBaza();
    }
  }

  public async ukloniIzOmiljenih() {
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();
    if (korisnik?.tip_korisnika == 'github') {
      this.ukloniIzOmiljenihLokalno();
    } else {
      this.ukloniIzOmiljenihBaza();
    }
  }

  public ngOnInit() {
    this.ruta.queryParams.subscribe(async (p) => {
      let id = parseInt(p['id']);

      this.omiljena = p['omiljena'] == 'da';

      if (this.omiljena) {
        let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();
        if (korisnik?.tip_korisnika == 'github') {
          this.dohvatiDetaljeLoklano(id);
        } else {
          this.dohvatiDetaljeBaza(id);
        }
      } else {
        this.dohvatiDetaljeTmdb(id);
      }
    });
  }

  private async dohvatiDetaljeTmdb(id: number) {
    try {
      let detalji = (await this.restServis.getResurs(`/tmdb/detalji_serije?idSerije=${id}`)) as SerijaDetalji;

      this.serija = detalji;
    } catch (nesto) {
      let greska = Greska.od(nesto);
    }
  }

  private async dohvatiDetaljeBaza(id: number) {
    try {
      let detalji = (await this.restServis.getResurs(`/baza/favoriti/${id}`)) as SerijaDetalji;

      this.serija = detalji;
    } catch (nesto) {
      let greska = Greska.od(nesto);
    }
  }

  private async spremiUOmiljeneBaza() {
    try {
      let odgovor = await this.restServis.postResurs('/baza/favoriti', {
        trazeni_kod: 201,
        tijelo: {
          id_serije: this.serija?.tmdb_id,
        },
      });

      this.poruka = Poruka.uspjeh('Serije je uspješno spremljena');
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(`Spremanje serije nije uspjelo\nPoruka: ${greska.poruka}`);
    }
  }

  private async ukloniIzOmiljenihBaza() {
    try {
      let odgovor = await this.restServis.deleteResurs(`/baza/favoriti/${this.serija!.tmdb_id}`, {
        trazeni_kod: 201,
      });

      this.ruter.navigate(['omiljene_serije']);
    } catch (nesto) {
      let greska = Greska.od(nesto);

      this.poruka = Poruka.greska(`Brisanje serije iz omiljenih nije uspjelo\nPoruka: ${greska.poruka}`);
    }
  }

  private async dohvatiDetaljeLoklano(id: number) {
    this.serija = await this.lokalneSerijeServis.dajOmiljenuSeriju(id);
  }

  private spremiUOmiljeneLokalno() {
    try {
      this.lokalneSerijeServis.spremiSeriju(this.serija!);

      this.poruka = Poruka.uspjeh('Serije je uspješno spremljena u lokalni spremnik');
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(`Spremanje serije nije uspjelo\nPoruka: ${greska.poruka}`);
    }
  }

  private ukloniIzOmiljenihLokalno() {
    this.lokalneSerijeServis.ukloniSeriju(this.serija!.tmdb_id);
    this.ruter.navigate(['omiljene_serije']);
  }
}
