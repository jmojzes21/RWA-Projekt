const TMDBKlijent = require('../moduli/tmdb_klijent.js');
const upravitelj = require('./upravitelj.js');

class TmdbUpravitelj {
  _konf;
  _tmdbKlijent;
  _mojeStranicenje;
  _tmdbStranicenje = 20;
  _zapisiDao;

  constructor({ konf, zapisiDao }) {
    this._konf = konf;

    this._tmdbKlijent = new TMDBKlijent();
    this._tmdbKlijent.postaviApiKljuc(konf.tmdbApiKeyV3);

    this._mojeStranicenje = konf.appStranicenje;
    this._zapisiDao = zapisiDao;
  }

  tmdbPretraziSerije = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    let trazi = zahtjev.query.trazi;
    let stranica = parseInt(zahtjev.query.stranica);

    if (isNaN(stranica)) {
      stranica = 1;
    }

    if (trazi == undefined || trazi.length < 3 || stranica <= 0) {
      odgovor.status(417);
      odgovor.json({ opis: 'neočekivani podaci' });
      return;
    }

    let sekundarneStranice = this._prilagodiStranicenje({
      primarnaStranica: stranica,
      primarnoStranicenje: this._mojeStranicenje,
      sekundarnoStranicenje: this._tmdbStranicenje,
    });

    Promise.all(
      sekundarneStranice.map((s) => {
        return this._tmdbKlijent.pretraziSerije(trazi, s.stranica);
      }),
    )
      .then((dohvaceniSkupoviSerija) => {
        let serije = [];
        let ukupnoStranica = 0;
        let ukupnoRezultata = 0;

        for (let i = 0; i < sekundarneStranice.length; i++) {
          if (i == 0) {
            ukupnoRezultata = dohvaceniSkupoviSerija[i].total_results;
            ukupnoStranica = Math.ceil(ukupnoRezultata / this._mojeStranicenje);
            if (ukupnoStranica == 0) ukupnoStranica = 1;
          }

          let skupSerija = dohvaceniSkupoviSerija[i].results;

          let prvi = sekundarneStranice[i].prvi;
          let zadnji = sekundarneStranice[i].zadnji;

          for (let j = prvi; j <= zadnji && j < skupSerija.length; j++) {
            serije.push({
              naziv: skupSerija[j].name,
              opis: skupSerija[j].overview,
              tmdb_id: skupSerija[j].id,
              slika: skupSerija[j].poster_path,
            });
          }
        }

        odgovor.json({
          stranica: stranica,
          serije: serije,
          ukupnoStranica: ukupnoStranica,
          ukupnoRezultata: ukupnoRezultata,
        });
      })
      .catch((greska) => {
        odgovor.status(400);
        odgovor.json({ opis: 'dohvaćanje serija nije uspjelo' });
      });
  };

  tmdbDetaljiSerije = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    let idSerije = parseInt(zahtjev.query.idSerije);

    if (isNaN(idSerije)) {
      odgovor.status(417);
      odgovor.json({ opis: 'neočekivani podaci' });
      return;
    }

    let detaljiSerijeTmdb = await this._tmdbKlijent.dohvatiDetaljeSerije(idSerije);
    let serija = this._tmdbKlijent.prilagodiTmdbDetaljeSerije(detaljiSerijeTmdb);

    odgovor.json(serija);
  };

  _prilagodiStranicenje({ primarnaStranica, primarnoStranicenje, sekundarnoStranicenje }) {
    this._log('------------------------------------------------------------');
    this._log(`prilagodi straničenje: ${primarnoStranicenje} => ${sekundarnoStranicenje}`);
    this._log(`dohvati primarnu stranicu: ${primarnaStranica}`);

    let i1 = (primarnaStranica - 1) * primarnoStranicenje;
    let i2 = i1 + primarnoStranicenje - 1;

    this._log(`indeksi elemenata: ${i1} - ${i2}`);

    let s1 = Math.floor(i1 / sekundarnoStranicenje + 1);
    let s2 = Math.floor(i2 / sekundarnoStranicenje + 1);

    let rezultat = [];

    for (let s = s1; s <= s2; s++) {
      let i3 = (s - 1) * sekundarnoStranicenje;
      let i4 = i3 + sekundarnoStranicenje - 1;

      if (i3 < i1) i3 = i1;
      if (i4 > i2) i4 = i2;

      let prvi = i3 % sekundarnoStranicenje;
      let zadnji = i4 % sekundarnoStranicenje;

      this._log(`dohvati sekundarnu stranicu: ${s}, indeksi elemenata: ${prvi} - ${zadnji}`);

      rezultat.push({
        stranica: s,
        prvi: prvi,
        zadnji: zadnji,
      });
    }

    this._log('------------------------------------------------------------');

    return rezultat;
  }

  _log(tekst) {
    //console.debug(tekst);
  }
}

module.exports = TmdbUpravitelj;
