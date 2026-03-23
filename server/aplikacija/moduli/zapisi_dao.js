const Baza = require('./baza.js');
const datumi = require('./datumi.js');

class ZapisiDao {
  _baza;
  _stranicenje;
  _mapiranjeMetode;
  _mapiranjeOznakeMetode;

  constructor(putanja, stranicenje) {
    this._baza = new Baza(putanja);
    this._stranicenje = stranicenje;

    this._mapiranjeMetode = {
      GET: 'G',
      POST: 'P',
      PUT: 'U',
      DELETE: 'D',
    };
    this._mapiranjeOznakeMetode = {
      G: 'GET',
      P: 'POST',
      U: 'PUT',
      D: 'DELETE',
    };
  }

  dohvatiZapise = async (podaci) => {
    try {
      let stranica = podaci.stranica;

      this._baza.otvori();

      let parametri = {};
      let sql = this._pripremiSqlUpitZaDohvacanje(podaci, parametri);

      let zapisi = await this._baza.izvrsiUpit(sql, parametri);

      this._baza.zatvori();

      let ukupnoRezultata = 0;
      let ukupnoStranica = 1;
      if (zapisi.length > 0) {
        ukupnoRezultata = zapisi[0].ukupno_rezultata;
        ukupnoStranica = Math.ceil(ukupnoRezultata / this._stranicenje);
      }

      zapisi = zapisi.map((zapis) => {
        return {
          korisnicko_ime: zapis.korisnicko_ime,
          vrijeme: zapis.vrijeme,
          vrsta_zahtjeva: this._mapiranjeOznakeMetode[zapis.vrsta_zahtjeva],
          trazeni_resurs: zapis.trazeni_resurs,
          tijelo: zapis.tijelo,
        };
      });

      return {
        stranica: stranica,
        zapisi: zapisi,
        ukupnoStranica: ukupnoStranica,
        ukupnoRezultata: ukupnoRezultata,
      };
    } catch {
      return {
        stranica: 1,
        zapisi: [],
        ukupnoStranica: 1,
        ukupnoRezultata: 0,
      };
    }
  };

  dodajZapis = async (korisnicko_ime, zahtjev) => {
    try {
      this._baza.otvori();

      let sql = 'SELECT id_korisnika FROM korisnik WHERE korisnicko_ime = $korisnicko_ime';
      let korisnik = (await this._baza.izvrsiUpit(sql, { $korisnicko_ime: korisnicko_ime }))[0];
      if (korisnik == undefined) return false;

      let id_korisnika = korisnik.id_korisnika;
      let vrijeme = datumi.formatirajDatum(new Date(), 'yyyy-mm-dd HH:MM:ss');
      let vrsta_zahtjeva = this._mapiranjeMetode[zahtjev.method];
      let trazeni_resurs = zahtjev.url;
      let tijelo = JSON.stringify(zahtjev.body);

      if (tijelo == '{}') tijelo = undefined;

      let sql2 = 'INSERT INTO zapisi';
      sql2 += ' (id_korisnika, vrijeme, vrsta_zahtjeva, trazeni_resurs, tijelo)';
      sql2 += ' VALUES ($id_korisnika, $vrijeme, $vrsta_zahtjeva, $trazeni_resurs, $tijelo)';

      await this._baza.izvrsi(sql2, {
        $id_korisnika: id_korisnika,
        $vrijeme: vrijeme,
        $vrsta_zahtjeva: vrsta_zahtjeva,
        $trazeni_resurs: trazeni_resurs,
        $tijelo: tijelo,
      });

      this._baza.zatvori();
      return true;
    } catch (greska) {
      return false;
    }
  };

  _pripremiSqlUpitZaDohvacanje = (podaci, parametri) => {
    let stranica = podaci.stranica;
    let sortiraj = podaci.sortiraj;

    let datumOd = podaci.datumOd;
    let datumDo = podaci.datumDo;

    let vrijemeOd = podaci.vrijemeOd;
    let vrijemeDo = podaci.vrijemeDo;

    let offset = (stranica - 1) * this._stranicenje;
    let limit = this._stranicenje;

    let sql = "SELECT k.korisnicko_ime, z.vrijeme, z.vrsta_zahtjeva, z.trazeni_resurs, z.tijelo, COUNT(*) OVER() AS 'ukupno_rezultata' FROM zapisi z";
    sql += ' INNER JOIN korisnik k ON z.id_korisnika = k.id_korisnika';

    let filtri = [];

    if (datumOd != undefined) {
      filtri.push('date(z.vrijeme) >= $datum_od');
      parametri.$datum_od = datumi.formatirajDatum(datumOd, 'yyyy-mm-dd');
    }

    if (datumDo != undefined) {
      filtri.push('date(z.vrijeme) <= $datum_do');
      parametri.$datum_do = datumi.formatirajDatum(datumDo, 'yyyy-mm-dd');
    }

    if (vrijemeOd != undefined) {
      filtri.push('time(z.vrijeme) >= $vrijeme_od');
      parametri.$vrijeme_od = datumi.formatirajDatum(vrijemeOd, 'HH:MM:ss');
    }

    if (vrijemeDo != undefined) {
      filtri.push('time(z.vrijeme) <= $vrijeme_do');
      parametri.$vrijeme_do = datumi.formatirajDatum(vrijemeDo, 'HH:MM:ss');
    }

    if (filtri.length != 0) {
      sql += ' WHERE ' + filtri.join(' AND ');
    }

    if (sortiraj == 'm') {
      sql += ' ORDER BY z.vrsta_zahtjeva ASC';
    } else {
      sql += ' ORDER BY z.vrijeme DESC';
    }

    sql += ' LIMIT $limit OFFSET $offset';
    parametri.$offset = offset;
    parametri.$limit = limit;

    return sql;
  };
}

module.exports = ZapisiDao;
