const Baza = require('./baza.js');
const datumi = require('./datumi.js');

class KorisnikDAO {
  _baza;

  constructor(putanja) {
    this._baza = new Baza(putanja);
  }

  dohvatiSveKorisnike = async () => {
    try {
      this._baza.otvori();

      let sql =
        "SELECT k.id_korisnika, k.korisnicko_ime, k.email, k.ime, k.prezime, k.spol, k.datum_rodenja, k.najdraza_zivotinja, t.oznaka AS 'tip_korisnika' FROM korisnik k INNER JOIN tip_korisnika t ON k.tip_korisnika == t.id_tipa";
      let korisnici = await this._baza.izvrsiUpit(sql);

      this._baza.zatvori();

      for (let korisnik of korisnici) {
        if (korisnik.datum_rodenja != undefined) {
          korisnik.datum_rodenja = new Date(korisnik.datum_rodenja);
        }
      }

      return korisnici;
    } catch {
      return [];
    }
  };

  dohvatiKorisnika = async (korisnicko_ime) => {
    try {
      this._baza.otvori();

      let sql =
        "SELECT k.id_korisnika, k.korisnicko_ime, k.email, k.lozinka, k.sol, k.ime, k.prezime, k.spol, k.datum_rodenja, k.najdraza_zivotinja, k.totp_tajni_kljuc, k.totp_ukljuceno, t.oznaka AS 'tip_korisnika' FROM korisnik k INNER JOIN tip_korisnika t ON k.tip_korisnika == t.id_tipa";
      sql += ' WHERE korisnicko_ime = $korisnicko_ime';

      let korisnici = await this._baza.izvrsiUpit(sql, {
        $korisnicko_ime: korisnicko_ime,
      });

      this._baza.zatvori();

      let korisnik = korisnici[0];
      if (korisnik == undefined) {
        return undefined;
      }

      if (korisnik.datum_rodenja != undefined) {
        korisnik.datum_rodenja = new Date(korisnik.datum_rodenja);
      }
      korisnik.totp_ukljuceno = korisnik.totp_ukljuceno == 1;

      return korisnik;
    } catch {
      return undefined;
    }
  };

  dodajKorisnika = async (korisnik) => {
    try {
      if (korisnik.datum_rodenja != undefined) {
        korisnik.datum_rodenja = datumi.formatirajDatum(korisnik.datum_rodenja, 'yyyy-mm-dd HH:MM:ss');
      }

      this._baza.otvori();

      let sql = 'INSERT INTO korisnik';
      sql += ' (korisnicko_ime, email, lozinka, sol, ime, prezime, spol, datum_rodenja, najdraza_zivotinja, tip_korisnika)';
      sql += ' VALUES ($korisnicko_ime, $email, $lozinka, $sol, $ime, $prezime, $spol, $datum_rodenja, $najdraza_zivotinja, $tip_korisnika)';

      await this._baza.izvrsi(sql, {
        $korisnicko_ime: korisnik.korisnicko_ime,
        $email: korisnik.email,
        $lozinka: korisnik.lozinka,
        $sol: korisnik.sol,

        $ime: korisnik.ime,
        $prezime: korisnik.prezime,
        $spol: korisnik.spol,
        $datum_rodenja: korisnik.datum_rodenja,
        $najdraza_zivotinja: korisnik.najdraza_zivotinja,

        $tip_korisnika: korisnik.tip_korisnika,
      });

      this._baza.zatvori();
      return true;
    } catch (greska) {
      return false;
    }
  };

  azurirajKorisnika = async (korisnik) => {
    try {
      if (korisnik.datum_rodenja != undefined) {
        korisnik.datum_rodenja = datumi.formatirajDatum(korisnik.datum_rodenja, 'yyyy-mm-dd HH:MM:ss');
      }

      this._baza.otvori();

      let sql = 'UPDATE korisnik SET';
      sql += ' email = $email,';
      sql += ' lozinka = $lozinka,';
      sql += ' sol = $sol,';

      sql += ' ime = $ime,';
      sql += ' prezime = $prezime,';
      sql += ' spol = $spol,';
      sql += ' datum_rodenja = $datum_rodenja,';
      sql += ' najdraza_zivotinja = $najdraza_zivotinja';

      sql += ' WHERE id_korisnika = $id_korisnika';

      await this._baza.izvrsi(sql, {
        $email: korisnik.email,
        $lozinka: korisnik.lozinka,
        $sol: korisnik.sol,

        $ime: korisnik.ime,
        $prezime: korisnik.prezime,
        $spol: korisnik.spol,
        $datum_rodenja: korisnik.datum_rodenja,
        $najdraza_zivotinja: korisnik.najdraza_zivotinja,

        $id_korisnika: korisnik.id_korisnika,
      });

      this._baza.zatvori();
      return true;
    } catch (greska) {
      return false;
    }
  };

  azurirajDvorazinskuAutentifikaciju = async (korisnicko_ime, totp_tajni_kljuc, totp_ukljuceno) => {
    try {
      this._baza.otvori();

      let sql = 'UPDATE korisnik SET';
      sql += ' totp_tajni_kljuc = $totp_tajni_kljuc,';
      sql += ' totp_ukljuceno = $totp_ukljuceno';
      sql += ' WHERE korisnicko_ime = $korisnicko_ime';

      await this._baza.izvrsi(sql, {
        $totp_tajni_kljuc: totp_tajni_kljuc,
        $totp_ukljuceno: totp_ukljuceno,
        $korisnicko_ime: korisnicko_ime,
      });

      this._baza.zatvori();
      return true;
    } catch (greska) {
      return false;
    }
  };

  obrisiKorisnika = async (korisnik) => {
    try {
      this._baza.otvori();

      let sql = 'DELETE FROM korisnik WHERE id_korisnika = $id_korisnika';
      await this._baza.izvrsi(sql, { $id_korisnika: korisnik.id_korisnika });

      this._baza.zatvori();
      return true;
    } catch (greska) {
      return false;
    }
  };

  dohvatiTipKorisnikaPremaOznaki = async (oznaka) => {
    try {
      this._baza.otvori();

      let sql = 'SELECT * FROM tip_korisnika WHERE oznaka = $oznaka';
      let tipovi = await this._baza.izvrsiUpit(sql, { $oznaka: oznaka });

      this._baza.zatvori();
      return tipovi[0];
    } catch {
      return undefined;
    }
  };
}

module.exports = KorisnikDAO;
