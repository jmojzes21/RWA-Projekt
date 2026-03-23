import { Injectable } from '@angular/core';
import { IRestPodaci } from '../entiteti/rest_tipovi';
import { Greska } from '../entiteti/greske';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  constructor() {}

  public async getResurs(resurs: string, podaci: IRestPodaci = {}): Promise<any> {
    return this.fetchResurs('GET', resurs, podaci);
  }

  public async postResurs(resurs: string, podaci: IRestPodaci = {}): Promise<any> {
    return this.fetchResurs('POST', resurs, podaci);
  }

  public async putResurs(resurs: string, podaci: IRestPodaci = {}): Promise<any> {
    return this.fetchResurs('PUT', resurs, podaci);
  }

  public async deleteResurs(resurs: string, podaci: IRestPodaci = {}): Promise<any> {
    return this.fetchResurs('DELETE', resurs, podaci);
  }

  private async dohvatiToken(): Promise<string | undefined> {
    let korisnicko_ime = sessionStorage.getItem('korisnicko_ime');
    if (korisnicko_ime == undefined) return undefined;

    try {
      let odgovor = await fetch(environment.restUrl + `/baza/korisnici/${korisnicko_ime}/prijava`, {
        method: 'GET',
        credentials: 'include',
      });
      let tekst = await odgovor.json();

      if (odgovor.status != 201) {
        return undefined;
      }

      let token = odgovor.headers.get('Authorization');
      if (token == undefined) return undefined;

      return token;
    } catch (nesto) {
      let greska = Greska.od(nesto);
      return undefined;
    }
  }

  private async fetchResurs(metoda: string, resurs: string, podaci: IRestPodaci) {
    let zaglavlje = new Headers();
    let tijelo = undefined;

    if (podaci.potreban_jwt != false) {
      let token = await this.dohvatiToken();
      if (token == undefined) {
        throw new Greska('Dohvaćanje JWT token nije uspjelo');
      }

      zaglavlje.set('Authorization', token);
    }

    if (podaci.tijelo != undefined) {
      zaglavlje.set('Content-Type', 'application/json');
      tijelo = JSON.stringify(podaci.tijelo);
    }

    let odgovor: Response;

    try {
      odgovor = await fetch(environment.restUrl + resurs, {
        method: metoda,
        credentials: 'include',
        body: tijelo,
        headers: zaglavlje,
      });
    } catch (greska) {
      console.error(greska);
      throw new Greska('Povezivanje s poslužiteljem nije uspjelo');
    }

    let rezultat;

    try {
      rezultat = await odgovor.json();
    } catch (greska) {
      console.error(greska);
      throw new Greska('Neočekivani podaci odgovora');
    }

    if (podaci.trazeni_kod == undefined) podaci.trazeni_kod = 200;
    if (odgovor.status != podaci.trazeni_kod) {
      throw new Greska(rezultat.opis);
    }

    return rezultat;
  }
}
