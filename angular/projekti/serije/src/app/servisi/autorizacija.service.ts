import { Injectable } from '@angular/core';
import { AutentifikacijaService } from './autentifikacija.service';
import { StavkaNavigacije } from '../entiteti/stavke_navigacije';

@Injectable({
  providedIn: 'root',
})
export class AutorizacijaService {
  constructor(private autentifikacijaServis: AutentifikacijaService) {}

  public dajStavkeNavigacije(): StavkaNavigacije[] {
    let stavke: StavkaNavigacije[] = [];
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();

    if (korisnik != undefined) {
      stavke.push({ url: '/pocetna', tekst: 'Početna' });
      stavke.push({ url: '/omiljene_serije', tekst: 'Omiljene serije' });

      if (korisnik.tip_korisnika != 'github') {
        stavke.push({ url: '/profil', tekst: 'Moj profil' });
      }

      if (korisnik.tip_korisnika == 'admin') {
        stavke.push({ url: '/korisnici', tekst: 'Korisnici' });
        stavke.push({ url: '/registracija', tekst: 'Registracija' });
        stavke.push({ url: '/dnevnik', tekst: 'Dnevnik' });
      }
    }

    stavke.push({ url: '/dokumentacija', tekst: 'Dokumentacija' });

    return stavke;
  }
}
