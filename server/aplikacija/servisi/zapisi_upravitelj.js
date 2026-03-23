const upravitelj = require('./upravitelj.js');
const datumi = require('../moduli/datumi.js');

class ZapisiUpravitelj {
  _konf;
  _zapisiDao;
  _korisnikDao;

  constructor({ konf, zapisiDao, korisnikDao }) {
    this._konf = konf;
    this._zapisiDao = zapisiDao;
    this._korisnikDao = korisnikDao;
  }

  getZapisi = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika != 'admin') {
      upravitelj.zabranjenPristupAdmin403(odgovor);
      return;
    }

    let podaci = {
      stranica: parseInt(upravitelj.parsiraj(zahtjev.query.stranica)),
      sortiraj: upravitelj.parsiraj(zahtjev.query.sortiraj),

      datumOd: upravitelj.parsiraj(zahtjev.query.datumOd),
      datumDo: upravitelj.parsiraj(zahtjev.query.datumDo),

      vrijemeOd: upravitelj.parsiraj(zahtjev.query.vrijemeOd),
      vrijemeDo: upravitelj.parsiraj(zahtjev.query.vrijemeDo),
    };

    let ok = this._provjeriParametre(podaci);
    if (ok == false) {
      upravitelj.neocekivaniPodaci(odgovor);
      return;
    }

    let zapisi = await this._zapisiDao.dohvatiZapise(podaci);

    odgovor.status(200);
    odgovor.json(zapisi);
  };

  _provjeriParametre = (podaci) => {
    if (isNaN(podaci.stranica)) {
      return false;
    }

    if (podaci.sortiraj == undefined) {
      return false;
    }

    if (podaci.sortiraj != 'd' && podaci.sortiraj != 'm') {
      return false;
    }

    if (podaci.datumOd != undefined) {
      let datum = datumi.parsirajDatum(podaci.datumOd);
      if (datum == undefined) return false;

      podaci.datumOd = datum;
    }

    if (podaci.datumDo != undefined) {
      let datum = datumi.parsirajDatum(podaci.datumDo);
      if (datum == undefined) return false;

      podaci.datumDo = datum;
    }

    if (podaci.vrijemeOd != undefined) {
      let datum = datumi.parsirajVrijeme(podaci.vrijemeOd);
      if (datum == undefined) return false;

      podaci.vrijemeOd = datum;
    }

    if (podaci.vrijemeDo != undefined) {
      let datum = datumi.parsirajVrijeme(podaci.vrijemeDo);
      if (datum == undefined) return false;

      podaci.vrijemeDo = datum;
    }

    return true;
  };
}

module.exports = ZapisiUpravitelj;
