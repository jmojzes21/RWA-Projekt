import { Component, OnInit } from '@angular/core';
import { RestService } from '../../servisi/rest.service';
import { Greska } from '../../entiteti/greske';
import { Korisnik } from '../../entiteti/korisnik';
import { Poruka } from '../../entiteti/poruka';

@Component({
  selector: 'app-korisnici',
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.scss',
})
export class KorisniciComponent implements OnInit {
  public korisnici: Korisnik[] = [];
  public brisi_korisnicko_ime: string = '';

  public poruka?: Poruka = undefined;

  constructor(private restServis: RestService) {}

  public async dohvatiKorisnike() {
    try {
      let podaci = (await this.restServis.getResurs('/baza/korisnici/')) as Korisnik[];

      this.korisnici = podaci;
    } catch (nesto) {
      let greska = Greska.od(nesto);

      this.poruka = Poruka.greska(`Dohvat podataka nije uspio\nPoruka: ${greska.poruka}`);
    }
  }

  public async obrisiKorisnika() {
    if (this.brisi_korisnicko_ime == '') {
      this.poruka = Poruka.greska('Niste unijeli korisničko ime');
      return;
    }

    try {
      let odgovor = await this.restServis.deleteResurs(`/baza/korisnici/${this.brisi_korisnicko_ime}`, {
        trazeni_kod: 201,
      });

      this.brisi_korisnicko_ime = '';
      await this.dohvatiKorisnike();

      this.poruka = Poruka.uspjeh('Korisnik je uspješno obrisan');
    } catch (nesto) {
      let greska = Greska.od(nesto);

      this.poruka = Poruka.greska(`Brisanje korisnika nije uspjelo\nPoruka: ${greska.poruka}`);
    }
  }

  public ngOnInit() {
    this.dohvatiKorisnike();
  }
}
