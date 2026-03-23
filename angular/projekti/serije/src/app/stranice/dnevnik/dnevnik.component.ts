import { Component, OnInit } from '@angular/core';
import { RestService } from '../../servisi/rest.service';
import { Greska } from '../../entiteti/greske';
import { IStranicaZapisa, Zapis } from '../../entiteti/zapis';
import { formatirajDatumRest, formatirajVrijemeRest, parsirajDatum, parsirajVrijeme } from '../../servisi/datumi';
import { Poruka } from '../../entiteti/poruka';

@Component({
  selector: 'app-dnevnik',
  templateUrl: './dnevnik.component.html',
  styleUrl: './dnevnik.component.scss',
})
export class DnevnikComponent implements OnInit {
  public sortiranje: string = 'd';
  public datumOd: string = '';
  public datumDo: string = '';
  public vrijemeOd: string = '';
  public vrijemeDo: string = '';

  public zapisi: Zapis[] = [];

  public stranica: number = 1;
  public ukupnoStranica: number = 1;
  public ukupnoZapisa: number = 0;

  public poruka?: Poruka = undefined;

  constructor(private restServis: RestService) {}

  public async osvjeziZapise(stranica: number) {
    try {
      let parametri = `stranica=${stranica}`;
      parametri += `&sortiraj=${this.sortiranje}`;

      let datumOd = undefined;
      let datumDo = undefined;
      let vrijemeOd = undefined;
      let vrijemeDo = undefined;

      if (this.datumOd != '') {
        datumOd = parsirajDatum(this.datumOd);
        if (datumOd == undefined) throw 'Pogrešan format početnog datuma';

        parametri += `&datumOd=${formatirajDatumRest(datumOd)}`;
      }

      if (this.datumDo != '') {
        datumDo = parsirajDatum(this.datumDo);
        if (datumDo == undefined) throw 'Pogrešan format završnog datuma';

        parametri += `&datumDo=${formatirajDatumRest(datumDo)}`;
      }

      if (this.vrijemeOd != '') {
        vrijemeOd = parsirajVrijeme(this.vrijemeOd);
        if (vrijemeOd == undefined) throw 'Pogrešan format početnog vremena';

        parametri += `&vrijemeOd=${formatirajVrijemeRest(vrijemeOd)}`;
      }

      if (this.vrijemeDo != '') {
        vrijemeDo = parsirajVrijeme(this.vrijemeDo);
        if (vrijemeDo == undefined) throw 'Pogrešan format završnog vremena';

        parametri += `&vrijemeDo=${formatirajVrijemeRest(vrijemeDo)}`;
      }

      let odgovor = (await this.restServis.getResurs(`/baza/dnevnik?${parametri}`)) as IStranicaZapisa;

      this.zapisi = odgovor.zapisi;

      this.stranica = odgovor.stranica;
      this.ukupnoStranica = odgovor.ukupnoStranica;
      this.ukupnoZapisa = odgovor.ukupnoRezultata;
      this.poruka = undefined;
    } catch (nesto) {
      let greska = Greska.od(nesto);
      this.poruka = Poruka.greska(greska.poruka);
    }
  }

  public ngOnInit() {
    this.osvjeziZapise(this.stranica);
  }
}
