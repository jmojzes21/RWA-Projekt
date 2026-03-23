const SQLite = require('sqlite3').Database;

class Baza {
  _putanja;
  _vezaDB;

  constructor(putanja) {
    this._putanja = putanja;
  }

  otvori = () => {
    this._vezaDB = new SQLite(this._putanja);
  };

  izvrsiUpit = async (sql, podaci) => {
    return new Promise((uspjeh, neuspjeh) => {
      this._vezaDB.all(sql, podaci, (greska, rezultat) => {
        if (greska) {
          neuspjeh(greska);
        } else {
          uspjeh(rezultat);
        }
      });
    });
  };

  izvrsi = async (sql, podaci) => {
    return new Promise((uspjeh, neuspjeh) => {
      this._vezaDB.run(sql, podaci, (greska) => {
        if (greska) {
          neuspjeh(greska);
        } else {
          uspjeh();
        }
      });
    });
  };

  zatvori = () => {
    this._vezaDB.close();
  };
}

module.exports = Baza;
