import { Injectable } from '@angular/core';
import { AutentifikacijaService } from './autentifikacija.service';
import { ILokalneSerije, SerijaDetalji } from '../entiteti/serija';

@Injectable({
  providedIn: 'root',
})
export class SerijeLokalnoService {
  constructor(private autentifikacijaServis: AutentifikacijaService) {}

  public async dajOmiljeneSerije(): Promise<SerijaDetalji[]> {
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();

    let omiljene_serije = this.ucitajOmiljeneSerije(korisnik!.korisnicko_ime);
    return omiljene_serije;
  }

  public async dajOmiljenuSeriju(id: number): Promise<SerijaDetalji | undefined> {
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();

    let omiljene_serije = this.ucitajOmiljeneSerije(korisnik!.korisnicko_ime);
    let serija = omiljene_serije.find((s) => s.tmdb_id == id);

    return serija;
  }

  public async spremiSeriju(serija: SerijaDetalji) {
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();

    let omiljene_serije = this.ucitajOmiljeneSerije(korisnik!.korisnicko_ime);

    let postoji = omiljene_serije.some((s) => s.tmdb_id == serija.tmdb_id);

    if (postoji == false) {
      omiljene_serije.push(serija);
      this.spremiOmiljeneSerije(korisnik!.korisnicko_ime, omiljene_serije);
    }
  }

  public async ukloniSeriju(id: number) {
    let korisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();

    let omiljene_serije = this.ucitajOmiljeneSerije(korisnik!.korisnicko_ime);
    omiljene_serije = omiljene_serije.filter((s) => s.tmdb_id != id);

    this.spremiOmiljeneSerije(korisnik!.korisnicko_ime, omiljene_serije);
  }

  private ucitajOmiljeneSerije(korisnicko_ime: string): SerijaDetalji[] {
    let kljuc = `github_korisnik_${korisnicko_ime}`;

    let podaciTekst = localStorage.getItem(kljuc);

    if (podaciTekst == undefined || podaciTekst.trim() == '') {
      return [];
    }

    let podaci = JSON.parse(podaciTekst) as ILokalneSerije;
    return podaci.omiljene_serije;
  }

  private spremiOmiljeneSerije(korisnicko_ime: string, omiljene_serije: SerijaDetalji[]) {
    let kljuc = `github_korisnik_${korisnicko_ime}`;

    let podaci: ILokalneSerije = {
      omiljene_serije: omiljene_serije,
    };

    localStorage.setItem(kljuc, JSON.stringify(podaci));
  }
}
