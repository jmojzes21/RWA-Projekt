import express from 'express';
import sesija from 'express-session';
import path from 'path';
import cors from 'cors';
import kolacici from 'cookie-parser';

import Konfiguracija from './konfiguracija.js';

import KorisnikDAO from './moduli/korisnik_dao.js';
import FavoritiDAO from './moduli/favoriti_dao.js';
import ZapisiDao from './moduli/zapisi_dao.js';

import upravitelj from './servisi/upravitelj.js';
import KorisnikUpravitelj from './servisi/korisnik_upravitelj.js';
import FavoritiUpravitelj from './servisi/favoriti_upravitelj.js';
import ZapisiUpravitelj from './servisi/zapisi_upravitelj.js';
import TmdbUpravitelj from './servisi/tmdb_upravitelj.js';
import AutentifikacijaUpravitelj from './servisi/autentifikacija_upravitelj.js';

import pocetnaPutanja from './pocetna_putanja.js';

const port = 8080;

let restUrl = `http://localhost:${port}`;
let stranicaUrl = `http://localhost:${port}`;

const server = express();

const putanjaBaze = path.join(pocetnaPutanja, '..', 'baza', 'RWA2023jmojzes21.sqlite');

const konf = new Konfiguracija();

async function postaviKonfiguraciju() {
  let args = process.argv;

  if (args.length < 3) {
    throw 'Nedostaje parametar za konfiguracijsku datoteku';
  }

  let putanja = args[2];
  console.log(`Putanja konfiguracije: ${putanja}`);

  await konf.ucitaj(putanja);
}

async function pokreniServer() {
  let args = process.argv;
  if (args.length == 4) {
    if (args[3] == 'dev') {
      stranicaUrl = 'http://localhost:4200';
    }
  }

  console.log(`Početna putanja: ${pocetnaPutanja}`);
  console.log(`Putanja baze: ${putanjaBaze}`);

  try {
    await postaviKonfiguraciju();
    console.log('Konfiguracija uspješno učitana');
  } catch (greska) {
    console.error('--- GREŠKA ---');
    console.error('Greška kod učitavanja konfiguracije');
    console.error(greska);
    return;
  }

  server.use(kolacici());
  server.use(
    cors({
      origin: ['http://localhost:4200', stranicaUrl],
      credentials: true,
    }),
  );

  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());
  server.use(
    sesija({
      secret: konf.tajniKljucSesija,
      cookie: {
        maxAge: 3 * 60 * 60 * 1000,
        httpOnly: true,
      },
      resave: false,
      saveUninitialized: true,
    }),
  );

  pripremiRestPutanje();
  pripremiAngularPutanje();

  server.use((zahtjev, odgovor) => {
    upravitelj.nemaResursa404(odgovor);
  });

  server.listen(port, () => {
    console.log(`Server pokrenut na portu: ${port}`);
  });
}

pokreniServer();

function pripremiRestPutanje() {
  let korisnikDao = new KorisnikDAO(putanjaBaze);
  let favoritiDao = new FavoritiDAO(putanjaBaze);
  let zapisiDao = new ZapisiDao(putanjaBaze, konf.appStranicenje);

  let autentifikacijaUpravitelj = new AutentifikacijaUpravitelj({
    konf,
    korisnikDao,
    zapisiDao,
    restUrl,
    stranicaUrl,
  });

  let korisnikUpravitelj = new KorisnikUpravitelj({
    konf,
    korisnikDao,
    zapisiDao,
    autentifikacijaUpravitelj,
  });
  let favoritiUpravitelj = new FavoritiUpravitelj({
    konf,
    korisnikDao,
    favoritiDao,
    zapisiDao,
  });
  let zapisiUpravitelj = new ZapisiUpravitelj({ konf, zapisiDao, korisnikDao });
  let tmdbUpravitelj = new TmdbUpravitelj({ konf, zapisiDao });

  server.get('/tmdb/pretrazi_serije', tmdbUpravitelj.tmdbPretraziSerije);
  server.get('/tmdb/detalji_serije', tmdbUpravitelj.tmdbDetaljiSerije);

  server.get('/baza/korisnici', korisnikUpravitelj.getKorisnici);
  server.post('/baza/korisnici', korisnikUpravitelj.postKorisnici);
  server.put('/baza/korisnici', upravitelj.nijeImplementirano501);
  server.delete('/baza/korisnici', upravitelj.nijeImplementirano501);

  server.get('/baza/korisnici/:korime', korisnikUpravitelj.getKorisnik);
  server.post('/baza/korisnici/:korime', korisnikUpravitelj.postKorisnik);
  server.put('/baza/korisnici/:korime', korisnikUpravitelj.putKorisnik);
  server.delete('/baza/korisnici/:korime', korisnikUpravitelj.deleteKorisnik);

  server.get('/baza/korisnici/:korime/prijava', autentifikacijaUpravitelj.getPrijava);
  server.post('/baza/korisnici/:korime/prijava', autentifikacijaUpravitelj.postPrijava);
  server.post('/baza/korisnici/:korime/totp_prijava', autentifikacijaUpravitelj.postPrijavaTotp);

  server.put('/baza/korisnici/:korime/prijava', upravitelj.nijeImplementirano501);
  server.delete('/baza/korisnici/:korime/prijava', upravitelj.nijeImplementirano501);

  server.get('/baza/favoriti', favoritiUpravitelj.getFavoriti);
  server.post('/baza/favoriti', favoritiUpravitelj.postFavoriti);
  server.put('/baza/favoriti', upravitelj.nijeImplementirano501);
  server.delete('/baza/favoriti', upravitelj.nijeImplementirano501);

  server.get('/baza/favoriti/:id', favoritiUpravitelj.getFavorit);
  server.post('/baza/favoriti/:id', favoritiUpravitelj.postFavorit);
  server.put('/baza/favoriti/:id', favoritiUpravitelj.putFavorit);
  server.delete('/baza/favoriti/:id', favoritiUpravitelj.deleteFavorit);

  server.get('/baza/dnevnik', zapisiUpravitelj.getZapisi);
  server.post('/baza/dnevnik', upravitelj.nijeImplementirano501);
  server.put('/baza/dnevnik', upravitelj.nijeImplementirano501);
  server.delete('/baza/dnevnik', upravitelj.nijeImplementirano501);

  server.post('/baza/korisnici/:korime/2fa_auth', autentifikacijaUpravitelj.postAzurirajDvorazinskuAutentifikaciju);

  server.get('/github_prijava', autentifikacijaUpravitelj.gitHubPrijavaUrl);
  server.get('/githubPovratno', autentifikacijaUpravitelj.gitHubPovratno);

  server.get('/trenutni_korisnik', autentifikacijaUpravitelj.getTrenutniKorisnik);
  server.post('/odjava', autentifikacijaUpravitelj.postOdjava);

  server.get('/recaptcha_javni_kljuc', (zahtjev, odgovor) => {
    odgovor.json({ kljuc: konf.javniKljucCaptcha });
  });
}

function pripremiAngularPutanje() {
  const angular_app = path.join(pocetnaPutanja, '..', 'angular');

  server.use('/', express.static(angular_app));
  //server.get('*', (zahtjev, odgovor) => odgovor.sendFile(path.join(angular_app, 'index.html')));
}
