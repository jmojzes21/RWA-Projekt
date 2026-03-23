const fs = require('fs');

class Konfiguracija {
  jwtValjanost = undefined;
  jwtTajniKljuc = undefined;
  tajniKljucSesija = undefined;
  appStranicenje = undefined;
  tmdbApiKeyV3 = undefined;
  tmdbApiKeyV4 = undefined;

  tajniKljucCaptcha = undefined;
  javniKljucCaptcha = undefined;

  githubTajniKljuc = undefined;
  githubClientID = undefined;

  async ucitaj(putanja) {
    return new Promise((resolve, reject) => {
      let postoji = fs.existsSync(putanja);

      if (postoji == false) {
        reject('Konfiguracijska datoteka ne postoji: ' + putanja);
        return;
      }

      fs.readFile(putanja, 'utf8', (greska, podaci) => {
        if (greska) {
          reject('Nije moguće otvoriti konfiguracijsku datoteku: ' + putanja);
          return;
        }

        try {
          this._parsirajKonfiguraciju(podaci);
          resolve();
        } catch (greska) {
          reject(greska);
        }
      });
    });
  }

  _parsirajVrijednostKonfiguracije(vrijednosti, naziv, parsiraj) {
    let vrijednost = vrijednosti.get(naziv);
    if (vrijednost == undefined || vrijednost.trim() == '') {
      throw `Nedostaje konfiguracija ${naziv}`;
    }

    return parsiraj(vrijednost, naziv);
  }

  _parsirajKonfiguraciju(podaci) {
    let redovi = podaci.split('\n');
    redovi = redovi.map((e) => e.trim());

    let vrijednosti = new Map();

    for (let red of redovi) {
      if (red.length == 0) continue;

      let d = red.split(':');

      if (d.length != 2) {
        throw `Pogrešni zapis konfiguracije: "${red}"`;
      }

      vrijednosti.set(d[0], d[1]);
    }

    let kljucRegex = new RegExp('^[a-zA-Z0-9]+$');

    this.jwtValjanost = this._parsirajVrijednostKonfiguracije(vrijednosti, 'jwtValjanost', (vrijednost, naziv) => {
      vrijednost = parseInt(vrijednost);
      if (isNaN(vrijednost) || vrijednost < 15 || vrijednost > 3600) {
        throw `Vrijednost konfiguracije ${naziv} mora biti broj između 15 i 3600, trenutno: ${vrijednost}`;
      }

      return vrijednost;
    });

    this.jwtTajniKljuc = this._parsirajVrijednostKonfiguracije(vrijednosti, 'jwtTajniKljuc', (vrijednost, naziv) => {
      if (vrijednost.length < 50 || vrijednost.length > 100) {
        throw `Vrijednost konfiguracije ${naziv} mora biti niz znakova veličine između 50 i 100 znakova, trenutna veličina: ${vrijednost.length}`;
      }

      if (kljucRegex.test(vrijednost) == false) {
        throw `Vrijednost konfiguracije ${naziv} sadrži nedozvoljene znakove, dozvoljeni znakovi su samo velika i mala slova te brojke`;
      }

      return vrijednost;
    });

    this.tajniKljucSesija = this._parsirajVrijednostKonfiguracije(vrijednosti, 'tajniKljucSesija', (vrijednost, naziv) => {
      if (vrijednost.length < 50 || vrijednost.length > 100) {
        throw `Vrijednost konfiguracije ${naziv} mora biti niz znakova veličine između 50 i 100 znakova, trenutna veličina: ${vrijednost.length}`;
      }

      if (kljucRegex.test(vrijednost) == false) {
        throw `Vrijednost konfiguracije ${naziv} sadrži nedozvoljene znakove, dozvoljeni znakovi su samo velika i mala slova te brojke`;
      }

      return vrijednost;
    });

    this.appStranicenje = this._parsirajVrijednostKonfiguracije(vrijednosti, 'appStranicenje', (vrijednost, naziv) => {
      vrijednost = parseInt(vrijednost);
      if (isNaN(vrijednost) || vrijednost < 5 || vrijednost > 100) {
        throw `Vrijednost konfiguracije ${naziv} mora biti broj između 5 i 100, trenutno: ${vrijednost}`;
      }

      return vrijednost;
    });

    this.tmdbApiKeyV3 = this._parsirajVrijednostKonfiguracije(vrijednosti, 'tmdbApiKeyV3', (vrijednost, naziv) => {
      return vrijednost;
    });

    this.tmdbApiKeyV4 = this._parsirajVrijednostKonfiguracije(vrijednosti, 'tmdbApiKeyV4', (vrijednost, naziv) => {
      return vrijednost;
    });

    this.tajniKljucCaptcha = this._parsirajVrijednostKonfiguracije(vrijednosti, 'tajniKljucCaptcha', (vrijednost, naziv) => {
      return vrijednost;
    });

    this.javniKljucCaptcha = this._parsirajVrijednostKonfiguracije(vrijednosti, 'javniKljucCaptcha', (vrijednost, naziv) => {
      return vrijednost;
    });

    this.githubTajniKljuc = this._parsirajVrijednostKonfiguracije(vrijednosti, 'githubTajniKljuc', (vrijednost, naziv) => {
      return vrijednost;
    });

    this.githubClientID = this._parsirajVrijednostKonfiguracije(vrijednosti, 'githubClientID', (vrijednost, naziv) => {
      return vrijednost;
    });
  }
}

module.exports = Konfiguracija;
