import { Component } from '@angular/core';
import { Greska } from '../../entiteti/greske';
import { RestService } from '../../servisi/rest.service';
import { Router } from '@angular/router';
import { IPretrazeneSerije, Serija } from '../../entiteti/serija';

@Component({
  selector: 'app-pocetna',
  templateUrl: './pocetna.component.html',
  styleUrl: './pocetna.component.scss',
})
export class PocetnaComponent {
  public unosPretrazivanje: string = '';
  public serije: Serija[] = [];

  public stranica: number = 1;
  public ukupnoStranica: number = 1;
  public ukupnoSerija: number = 0;

  constructor(private restServis: RestService, private ruter: Router) {}

  public pretrazi() {
    let tekst = this.unosPretrazivanje.trim();
    if (tekst.length >= 3) {
      this.dohvatiSerije(tekst, 1);
    }
  }

  public dohvatiStranicu(stranica: number) {
    let tekst = this.unosPretrazivanje.trim();
    if (tekst.length >= 3) {
      this.dohvatiSerije(tekst, stranica);
    }
  }

  public prikaziDetalje(id: number) {
    this.ruter.navigate(['detalji_serije'], {
      queryParams: {
        id: id,
      },
    });
  }

  private async dohvatiSerije(trazi: string, stranica: number) {
    try {
      let odgovor = (await this.restServis.getResurs(`/tmdb/pretrazi_serije?trazi=${trazi}&stranica=${stranica}`)) as IPretrazeneSerije;

      this.serije = odgovor.serije;

      this.stranica = odgovor.stranica;
      this.ukupnoStranica = odgovor.ukupnoStranica;
      this.ukupnoSerija = odgovor.ukupnoRezultata;
    } catch (nesto) {
      let greska = Greska.od(nesto);
    }
  }
}
