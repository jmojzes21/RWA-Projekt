const Baza = require('./baza.js');

class FavoritiDao {
  _baza;

  constructor(putanja) {
    this._baza = new Baza(putanja);
  }

  dohvatiSeriju = async (tmdb_id_serije) => {
    try {
      this._baza.otvori();

      let sql = 'SELECT tmdb_id, naziv, opis, broj_sezona, broj_epizoda, popularnost, slika, homepage FROM serija WHERE tmdb_id = $tmdb_id';
      let serije = await this._baza.izvrsiUpit(sql, { $tmdb_id: tmdb_id_serije });

      this._baza.zatvori();
      return serije[0];
    } catch {
      return undefined;
    }
  };

  dodajSerijuSezone = async (serija, sezone) => {
    try {
      this._baza.otvori();

      let sql = 'INSERT INTO serija';
      sql += ' (tmdb_id, naziv, opis, broj_sezona, broj_epizoda, popularnost, slika, homepage)';
      sql += ' VALUES ($tmdb_id, $naziv, $opis, $broj_sezona, $broj_epizoda, $popularnost, $slika, $homepage)';

      await this._baza.izvrsi(sql, {
        $tmdb_id: serija.tmdb_id,
        $naziv: serija.naziv,
        $opis: serija.opis,
        $broj_sezona: serija.broj_sezona,
        $broj_epizoda: serija.broj_epizoda,
        $popularnost: serija.popularnost,
        $slika: serija.slika,
        $homepage: serija.homepage,
      });

      for (let sezona of sezone) {
        let sql2 = 'INSERT INTO sezona_serije';
        sql2 += ' (tmdb_id_sezone, tmdb_id_serije, naziv, broj_sezone, broj_epizoda, opis, slika)';
        sql2 += ' VALUES ($tmdb_id_sezone, $tmdb_id_serije, $naziv, $broj_sezone, $broj_epizoda, $opis, $slika)';

        await this._baza.izvrsi(sql2, {
          $tmdb_id_sezone: sezona.tmdb_id_sezone,
          $tmdb_id_serije: sezona.tmdb_id_serije,
          $naziv: sezona.naziv,
          $broj_sezone: sezona.broj_sezone,
          $broj_epizoda: sezona.broj_epizoda,
          $opis: sezona.opis,
          $slika: sezona.slika,
        });
      }

      this._baza.zatvori();
      return true;
    } catch {
      return false;
    }
  };

  dohvatiOmiljeneSerije = async (id_korisnika) => {
    try {
      this._baza.otvori();

      let sql = 'SELECT s.tmdb_id, s.naziv, s.opis, s.broj_sezona, s.broj_epizoda, s.popularnost, s.slika, s.homepage FROM omiljene_serije f';
      sql += ' INNER JOIN serija s ON f.tmdb_id_serije = s.tmdb_id';
      sql += ' WHERE f.id_korisnika = $id_korisnika';

      let serije = await this._baza.izvrsiUpit(sql, { $id_korisnika: id_korisnika });
      for (let serija of serije) {
        let sql2 =
          "SELECT tmdb_id_sezone AS 'tmdb_id', naziv, broj_sezone, broj_epizoda, opis, slika FROM sezona_serije WHERE tmdb_id_serije = $tmdb_id_serije";
        let sezone = await this._baza.izvrsiUpit(sql2, { $tmdb_id_serije: serija.tmdb_id });

        serija.sezone = sezone;
      }

      this._baza.zatvori();
      return serije;
    } catch (greska) {
      return [];
    }
  };

  dohvatiOmiljenuSeriju = async (id_korisnika, tmdb_id_serije) => {
    try {
      this._baza.otvori();

      let sql = 'SELECT s.tmdb_id, s.naziv, s.opis, s.broj_sezona, s.broj_epizoda, s.popularnost, s.slika, s.homepage FROM omiljene_serije f';
      sql += ' INNER JOIN serija s ON f.tmdb_id_serije = s.tmdb_id';
      sql += ' WHERE f.id_korisnika = $id_korisnika AND f.tmdb_id_serije = $tmdb_id_serije';

      let serija = (await this._baza.izvrsiUpit(sql, { $id_korisnika: id_korisnika, $tmdb_id_serije: tmdb_id_serije }))[0];
      if (serija == undefined) return undefined;

      let sql2 = "SELECT tmdb_id_sezone AS 'tmdb_id', naziv, broj_sezone, broj_epizoda, opis, slika FROM sezona_serije WHERE tmdb_id_serije = $tmdb_id_serije";
      let sezone = await this._baza.izvrsiUpit(sql2, { $tmdb_id_serije: serija.tmdb_id });

      serija.sezone = sezone;

      this._baza.zatvori();
      return serija;
    } catch (greska) {
      return undefined;
    }
  };

  dodajFavorit = async (id_korisnika, tmdb_id_serije) => {
    try {
      this._baza.otvori();

      let sql = 'INSERT INTO omiljene_serije (id_korisnika, tmdb_id_serije) VALUES ($id_korisnika, $tmdb_id_serije)';
      await this._baza.izvrsi(sql, {
        $id_korisnika: id_korisnika,
        $tmdb_id_serije: tmdb_id_serije,
      });

      this._baza.zatvori();
      return true;
    } catch {
      return false;
    }
  };

  obrisiFavorit = async (id_korisnika, tmdb_id_serije) => {
    try {
      this._baza.otvori();

      let sql = 'DELETE FROM omiljene_serije WHERE id_korisnika = $id_korisnika AND tmdb_id_serije = $tmdb_id_serije';
      await this._baza.izvrsi(sql, {
        $id_korisnika: id_korisnika,
        $tmdb_id_serije: tmdb_id_serije,
      });

      this._baza.zatvori();
      return true;
    } catch {
      return false;
    }
  };
}

module.exports = FavoritiDao;
