const JwtToken = require('../moduli/jwt.js');
const kodovi = require('../moduli/kodiranje.js');
const upravitelj = require('./upravitelj.js');
const recaptcha = require('../moduli/recaptcha.js');
const github = require('../moduli/github.js');
const Totp = require('../moduli/totp.js');

class AutentifikacijaUpravitelj {
  _konf;
  _korisnikDao;
  _zapisiDao;
  _restUrl;
  _stranicaUrl;

  constructor({ konf, korisnikDao, zapisiDao, restUrl, stranicaUrl }) {
    this._konf = konf;
    this._korisnikDao = korisnikDao;
    this._zapisiDao = zapisiDao;
    this._restUrl = restUrl;
    this._stranicaUrl = stranicaUrl;
  }

  getPrijava = async (zahtjev, odgovor) => {
    let korisnikSesija = upravitelj.dajKorisnikaIzSesije(zahtjev);

    if (korisnikSesija == undefined) {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    let jwtToken = JwtToken.kreiraj(
      {
        korisnik: korisnikSesija.korisnicko_ime,
        tip: korisnikSesija.tip_korisnika,
      },
      this._konf.jwtTajniKljuc,
      this._konf.jwtValjanost,
    );

    odgovor.setHeader('Authorization', 'Bearer ' + jwtToken.token());
    odgovor.setHeader('Access-Control-Expose-Headers', 'Authorization');

    upravitelj.izvrseno201(odgovor);
  };

  postPrijava = async (zahtjev, odgovor) => {
    let podaci = zahtjev.body;

    let recaptchaProvjera = await recaptcha.provjeriRecaptchu('prijava', this._konf.tajniKljucCaptcha, upravitelj.parsiraj(podaci.recaptchaToken));

    if (recaptchaProvjera == false) {
      upravitelj.recaptchaNeuspjeh(odgovor);
      return;
    }

    let korisnicko_ime = upravitelj.parsiraj(podaci.korisnicko_ime);
    let lozinka = upravitelj.parsiraj(podaci.lozinka);

    if (korisnicko_ime == undefined || lozinka == undefined) {
      upravitelj.greska400(odgovor, 'niste unijeli korisničko ime ili lozinku');
      return;
    }

    let korisnik = await this._korisnikDao.dohvatiKorisnika(korisnicko_ime);
    if (korisnik == undefined) {
      upravitelj.greska400(odgovor, 'korisničko ime ne postoji');
      return;
    }

    let sol = korisnik.sol;
    let hashLozinke = this.kreirajHashLozinke(lozinka, sol);

    if (hashLozinke != korisnik.lozinka) {
      upravitelj.greska400(odgovor, 'lozinka nije točna');
      return;
    }

    if (korisnik.totp_ukljuceno) {
      zahtjev.session.privremeno = { korisnicko_ime: korisnik.korisnicko_ime };
      upravitelj.izvrseno201(odgovor, {
        status: 'totp',
      });
      return;
    }

    zahtjev.session.korisnik = korisnik.korisnicko_ime;
    zahtjev.session.tip = korisnik.tip_korisnika;

    upravitelj.izvrseno201(odgovor, {
      status: 'gotovo',
      korisnicko_ime: korisnik.korisnicko_ime,
      tip_korisnika: korisnik.tip_korisnika,
    });
  };

  postPrijavaTotp = async (zahtjev, odgovor) => {
    let privremeno = zahtjev.session.privremeno;
    let podaci = zahtjev.body;

    if (privremeno == undefined) {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    let korisnik = await this._korisnikDao.dohvatiKorisnika(privremeno.korisnicko_ime);
    if (korisnik == undefined) {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    let totp_tajni_kljuc = korisnik.totp_tajni_kljuc;
    let totp_kod = upravitelj.parsiraj(podaci.kod);
    let totp_trazeni_kod = await Totp.generirajKod(totp_tajni_kljuc);

    if (totp_kod != totp_trazeni_kod) {
      upravitelj.greska400(odgovor, 'netočan TOTP kod');
      return;
    }

    delete zahtjev.session.privremeno;
    zahtjev.session.korisnik = korisnik.korisnicko_ime;
    zahtjev.session.tip = korisnik.tip_korisnika;

    upravitelj.izvrseno201(odgovor, {
      status: 'gotovo',
      korisnicko_ime: korisnik.korisnicko_ime,
      tip_korisnika: korisnik.tip_korisnika,
    });
  };

  postAzurirajDvorazinskuAutentifikaciju = async (zahtjev, odgovor) => {
    let podaci = zahtjev.body;

    let recaptchaProvjera = await recaptcha.provjeriRecaptchu('azuriranje_profila', this._konf.tajniKljucCaptcha, upravitelj.parsiraj(podaci.recaptchaToken));

    if (recaptchaProvjera == false) {
      upravitelj.recaptchaNeuspjeh(odgovor);
      return;
    }

    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    let korisnicko_ime = zahtjev.params.korime;

    if (prijavljeniKorisnik.korisnicko_ime != korisnicko_ime || prijavljeniKorisnik.tip_korisnika == 'github') {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnik = await this._korisnikDao.dohvatiKorisnika(korisnicko_ime);

    let totp_ukljuceno = upravitelj.parsiraj(podaci.totp_ukljuceno) == 'true';
    let totp_tajni_kljuc = korisnik.totp_tajni_kljuc;

    let vrati_totp_tajni_kljuc = false;

    if (totp_ukljuceno && totp_tajni_kljuc == undefined) {
      totp_tajni_kljuc = Totp.kreirajTajniKljuc();
      vrati_totp_tajni_kljuc = true;
    }

    let uspjeh = await this._korisnikDao.azurirajDvorazinskuAutentifikaciju(korisnik.korisnicko_ime, totp_tajni_kljuc, totp_ukljuceno);

    if (uspjeh) {
      let tijelo = {};

      if (vrati_totp_tajni_kljuc) {
        tijelo.totp_podaci = {
          kljuc: totp_tajni_kljuc,
          algoritam: Totp.algoritam,
          znamenke: Totp.znamenke,
          period: Totp.period,
        };
      }

      upravitelj.izvrseno201(odgovor, tijelo);
    } else {
      upravitelj.greska400(odgovor, 'azuriranje dvorazinske autentifikacije nije uspjelo');
    }
  };

  gitHubPrijavaUrl = (zahtjev, odgovor) => {
    let clientId = this._konf.githubClientID;
    let povratniUrl = `${this._restUrl}/githubPovratno`;

    let url = github.dajGithubAuthUrl(clientId, povratniUrl);

    odgovor.json({ url: url });
  };

  gitHubPovratno = async (zahtjev, odgovor) => {
    let kod = upravitelj.parsiraj(zahtjev.query.code);

    let clientId = this._konf.githubClientID;
    let clientSecret = this._konf.githubTajniKljuc;

    let token = await github.dajAccessToken(clientId, clientSecret, kod);
    if (token == undefined) {
      odgovor.redirect(`${this._stranicaUrl}/prijava`);
      return;
    }

    let podaci = await github.provjeriToken(token);
    if (podaci == undefined) {
      odgovor.redirect(`${this._stranicaUrl}/prijava`);
      return;
    }

    zahtjev.session.korisnik = podaci.login;
    zahtjev.session.tip = 'github';
    zahtjev.session.githubToken = token;

    odgovor.redirect(this._stranicaUrl);
  };

  getTrenutniKorisnik = (zahtjev, odgovor) => {
    let korisnik = upravitelj.dajKorisnikaIzSesije(zahtjev);
    if (korisnik == undefined) {
      odgovor.json(null);
      return;
    }
    odgovor.json(korisnik);
  };

  postOdjava = (zahtjev, odgovor) => {
    zahtjev.session.destroy();
    upravitelj.izvrseno201(odgovor);
  };

  kreirajSol = () => {
    let uuid = kodovi.kreirajNasumicniUUID();
    return kodovi.kreirajSha256(uuid);
  };

  kreirajHashLozinke = (lozinka, sol) => {
    let a = Math.floor(sol.length / 2);

    let prvi = sol.substring(0, a);
    let drugi = sol.substring(a);

    return kodovi.kreirajSha256(prvi + lozinka + drugi);
  };
}

module.exports = AutentifikacijaUpravitelj;
