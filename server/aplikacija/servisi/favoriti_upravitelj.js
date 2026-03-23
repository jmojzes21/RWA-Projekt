const JwtToken = require('../moduli/jwt.js');
const kodovi = require('../moduli/kodiranje.js');
const upravitelj = require('./upravitelj.js');
const TMDBKlijent = require('../moduli/tmdb_klijent.js');

class FavoritiUpravitelj {
  _konf;
  _korisnikDao;
  _favoritiDao;
  _zapisiDao;
  _tmdbKlijent;

  constructor({ konf, korisnikDao, favoritiDao, zapisiDao }) {
    this._konf = konf;
    this._korisnikDao = korisnikDao;
    this._favoritiDao = favoritiDao;
    this._zapisiDao = zapisiDao;

    this._tmdbKlijent = new TMDBKlijent();
    this._tmdbKlijent.postaviApiKljuc(this._konf.tmdbApiKeyV3);
  }

  getFavoriti = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika == 'github') {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnik = await this._korisnikDao.dohvatiKorisnika(prijavljeniKorisnik.korisnicko_ime);
    if (korisnik == undefined) {
      upravitelj.greska400(odgovor);
      return;
    }

    let serije = await this._favoritiDao.dohvatiOmiljeneSerije(korisnik.id_korisnika);

    odgovor.status(200);
    odgovor.json(serije);
  };

  postFavoriti = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika == 'github') {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let podaci = zahtjev.body;
    let tmdb_id_serije = upravitelj.parsiraj(podaci.id_serije);

    let korisnik = await this._korisnikDao.dohvatiKorisnika(prijavljeniKorisnik.korisnicko_ime);
    if (korisnik == undefined) {
      upravitelj.greska400(odgovor);
      return;
    }

    let serija = await this._favoritiDao.dohvatiSeriju(tmdb_id_serije);

    if (serija == undefined) {
      let uspjeh = await this._dodajSeriju(tmdb_id_serije);
      if (uspjeh == false) {
        upravitelj.greska400(odgovor, 'nije moguće spremiti seriju');
        return;
      }
    }

    let f = await this._favoritiDao.dohvatiOmiljenuSeriju(korisnik.id_korisnika, tmdb_id_serije);
    if (f != undefined) {
      upravitelj.greska400(odgovor, 'serije je već spremljena u omiljene serije');
      return;
    }

    let uspjeh = await this._favoritiDao.dodajFavorit(korisnik.id_korisnika, tmdb_id_serije);
    if (uspjeh) {
      upravitelj.izvrseno201(odgovor);
    } else {
      upravitelj.greska400(odgovor, 'nije moguće spremiti seriju u omiljene serije');
    }
  };

  getFavorit = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika == 'github') {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnik = await this._korisnikDao.dohvatiKorisnika(prijavljeniKorisnik.korisnicko_ime);

    if (korisnik == undefined) {
      upravitelj.greska400(odgovor);
      return;
    }

    let tmdb_id_serije = zahtjev.params.id;

    let serija = await this._favoritiDao.dohvatiOmiljenuSeriju(korisnik.id_korisnika, tmdb_id_serije);
    if (serija == undefined) {
      upravitelj.nemaResursa404(odgovor);
      return;
    }

    odgovor.status(200);
    odgovor.json(serija);
  };

  postFavorit = async (zahtjev, odgovor) => {
    upravitelj.zabranjeno405(odgovor);
  };

  putFavorit = async (zahtjev, odgovor) => {
    upravitelj.zabranjeno405(odgovor);
  };

  deleteFavorit = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika == 'github') {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnik = await this._korisnikDao.dohvatiKorisnika(prijavljeniKorisnik.korisnicko_ime);

    if (korisnik == undefined) {
      upravitelj.greska400(odgovor);
      return;
    }

    let tmdb_id_serije = zahtjev.params.id;
    let uspjeh = await this._favoritiDao.obrisiFavorit(korisnik.id_korisnika, tmdb_id_serije);

    if (uspjeh) {
      upravitelj.izvrseno201(odgovor);
    } else {
      upravitelj.greska400(odgovor, 'nije moguće obrisati seriju iz omiljenih serija');
    }
  };

  _dodajSeriju = async (tmdb_id_serije) => {
    try {
      let detalji = await this._tmdbKlijent.dohvatiDetaljeSerije(tmdb_id_serije);
      let serija = this._tmdbKlijent.prilagodiTmdbDetaljeSerije(detalji);

      let uspjeh = await this._favoritiDao.dodajSerijuSezone(serija, serija.sezone);
      return uspjeh;
    } catch (greska) {
      return false;
    }
  };
}

module.exports = FavoritiUpravitelj;
