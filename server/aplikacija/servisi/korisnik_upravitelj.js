const JwtToken = require('../moduli/jwt.js');
const kodovi = require('../moduli/kodiranje.js');
const upravitelj = require('./upravitelj.js');
const datumi = require('../moduli/datumi.js');
const email = require('../moduli/email.js');
const recaptcha = require('../moduli/recaptcha.js');

class KorisnikUpravitelj {
  _konf;
  _autentifikacijaUpravitelj;
  _korisnikDao;
  _zapisiDao;

  constructor({ konf, korisnikDao, zapisiDao, autentifikacijaUpravitelj }) {
    this._konf = konf;
    this._autentifikacijaUpravitelj = autentifikacijaUpravitelj;
    this._korisnikDao = korisnikDao;
    this._zapisiDao = zapisiDao;
  }

  getKorisnici = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika != 'admin') {
      upravitelj.zabranjenPristupAdmin403(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnici = await this._korisnikDao.dohvatiSveKorisnike();

    for (let korisnik of korisnici) {
      if (korisnik.datum_rodenja != undefined) {
        korisnik.datum_rodenja = datumi.formatirajDatum(korisnik.datum_rodenja, 'yyyy-mm-dd');
      }
    }

    odgovor.status(200);
    odgovor.json(korisnici);
  };

  postKorisnici = async (zahtjev, odgovor) => {
    let recaptchaProvjera = await recaptcha.provjeriRecaptchu('registracija', this._konf.tajniKljucCaptcha, upravitelj.parsiraj(zahtjev.body.recaptchaToken));

    if (recaptchaProvjera == false) {
      upravitelj.recaptchaNeuspjeh(odgovor);
      return;
    }

    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika != 'admin') {
      upravitelj.zabranjenPristupAdmin403(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let podaci = zahtjev.body;

    let korisnik = {
      korisnicko_ime: upravitelj.parsiraj(podaci.korisnicko_ime),
      email: upravitelj.parsiraj(podaci.email),
      lozinka: upravitelj.parsiraj(podaci.lozinka),

      ime: upravitelj.parsiraj(podaci.ime),
      prezime: upravitelj.parsiraj(podaci.prezime),
      spol: upravitelj.parsiraj(podaci.spol),
      datum_rodenja: upravitelj.parsiraj(podaci.datum_rodenja),
      najdraza_zivotinja: upravitelj.parsiraj(podaci.najdraza_zivotinja),

      tip_korisnika: upravitelj.parsiraj(podaci.tip_korisnika),
    };

    try {
      if (korisnik.korisnicko_ime == undefined) {
        throw new Error('niste unijeli korisničko ime');
      }

      if (korisnik.email == undefined) {
        throw new Error('niste unijeli email');
      }

      let emailReg = /^(\w+)(\.\w+)*\@(\w+)(\.\w+)*$/gm;
      if (emailReg.test(korisnik.email) == false) {
        throw new Error('email nije valjan');
      }

      if (korisnik.lozinka == undefined) {
        throw new Error('niste unijeli lozinku');
      }

      if (korisnik.tip_korisnika == undefined) {
        throw new Error('niste unijeli tip korisnika');
      }

      if (korisnik.spol != undefined) {
        if (korisnik.spol != 'M' && korisnik.spol != 'Z') {
          throw new Error('pogrešan spol');
        }
      }

      if (korisnik.datum_rodenja != undefined) {
        let datum = datumi.parsirajDatum(korisnik.datum_rodenja);
        if (datum == undefined) {
          throw new Error('pogrešan format datuma rođenja');
        }

        korisnik.datum_rodenja = datum;
      }

      let k2 = await this._korisnikDao.dohvatiKorisnika(korisnik.korisnicko_ime);

      if (k2 != undefined) {
        throw new Error('korisnik sa tim korisničkim imenom već postoji');
      }

      let tip = await this._korisnikDao.dohvatiTipKorisnikaPremaOznaki(korisnik.tip_korisnika);
      if (tip == undefined) {
        throw new Error('pogrešan tip korisnika');
      }

      korisnik.tip_korisnika = tip.id_tipa;
    } catch (greska) {
      upravitelj.greska400(odgovor, greska.message);
      return;
    }

    let originalLozinka = korisnik.lozinka;

    let sol = this._autentifikacijaUpravitelj.kreirajSol();
    let hashLozinke = this._autentifikacijaUpravitelj.kreirajHashLozinke(korisnik.lozinka, sol);

    korisnik.sol = sol;
    korisnik.lozinka = hashLozinke;

    let uspjeh = await this._korisnikDao.dodajKorisnika(korisnik);
    if (uspjeh) {
      this._posaljiEmail(korisnik, originalLozinka);
      upravitelj.izvrseno201(odgovor);
    } else {
      upravitelj.greska400(odgovor, 'kreiranje korisnika nije uspjelo');
    }
  };

  getKorisnik = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    let korisnicko_ime = zahtjev.params.korime;

    if (prijavljeniKorisnik.tip_korisnika != 'admin' && prijavljeniKorisnik.korisnicko_ime != korisnicko_ime) {
      upravitelj.zabranjenPristupAdmin403(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika == 'github') {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnik = await this._korisnikDao.dohvatiKorisnika(korisnicko_ime);
    if (korisnik == undefined) {
      upravitelj.nemaResursa404(odgovor);
      return;
    }

    if (korisnik.datum_rodenja != undefined) {
      korisnik.datum_rodenja = datumi.formatirajDatum(korisnik.datum_rodenja, 'yyyy-mm-dd');
    }

    delete korisnik.lozinka;
    delete korisnik.sol;
    delete korisnik.totp_tajni_kljuc;

    odgovor.status(200);
    odgovor.json(korisnik);
  };

  postKorisnik = (zahtjev, odgovor) => {
    upravitelj.zabranjeno405(odgovor);
  };

  putKorisnik = async (zahtjev, odgovor) => {
    let recaptchaProvjera = await recaptcha.provjeriRecaptchu(
      'azuriranje_profila',
      this._konf.tajniKljucCaptcha,
      upravitelj.parsiraj(zahtjev.body.recaptchaToken),
    );

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

    if (prijavljeniKorisnik.tip_korisnika != 'admin' && prijavljeniKorisnik.korisnicko_ime != korisnicko_ime) {
      upravitelj.zabranjenPristupAdmin403(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika == 'github') {
      upravitelj.zabranjenPristup401(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnik = await this._korisnikDao.dohvatiKorisnika(korisnicko_ime);
    if (korisnik == undefined) {
      upravitelj.nemaResursa404(odgovor);
      return;
    }

    let podaci = zahtjev.body;

    let noviPodaci = {
      id_korisnika: korisnik.id_korisnika,
      korisnicko_ime: korisnik.korisnicko_ime,
      email: korisnik.email,
      lozinka: korisnik.lozinka,
      sol: korisnik.sol,

      ime: upravitelj.parsiraj(podaci.ime),
      prezime: upravitelj.parsiraj(podaci.prezime),
      spol: upravitelj.parsiraj(podaci.spol),
      datum_rodenja: upravitelj.parsiraj(podaci.datum_rodenja),
      najdraza_zivotinja: upravitelj.parsiraj(podaci.najdraza_zivotinja),
    };

    try {
      if (noviPodaci.spol != undefined) {
        if (noviPodaci.spol != 'M' && noviPodaci.spol != 'Z') {
          throw new Error('pogrešan spol');
        }
      }

      if (noviPodaci.datum_rodenja != undefined) {
        let datum = datumi.parsirajDatum(noviPodaci.datum_rodenja);
        if (datum == undefined) {
          throw new Error('pogrešan format datuma rođenja');
        }

        noviPodaci.datum_rodenja = datum;
      }
    } catch (greska) {
      upravitelj.greska400(odgovor, greska.message);
      return;
    }

    let uspjeh = await this._korisnikDao.azurirajKorisnika(noviPodaci);
    if (uspjeh) {
      upravitelj.izvrseno201(odgovor);
    } else {
      upravitelj.greska400(odgovor, 'ažuriranje korisnika nije uspjelo');
    }
  };

  deleteKorisnik = async (zahtjev, odgovor) => {
    let prijavljeniKorisnik = upravitelj.dajPrijavljenogKorisnika(zahtjev, this._konf.jwtTajniKljuc);

    if (prijavljeniKorisnik == undefined) {
      upravitelj.potrebnaPrijava401(odgovor);
      return;
    }

    if (prijavljeniKorisnik.tip_korisnika != 'admin') {
      upravitelj.zabranjenPristupAdmin403(odgovor);
      return;
    }

    await this._zapisiDao.dodajZapis(prijavljeniKorisnik.korisnicko_ime, zahtjev);

    let korisnicko_ime = zahtjev.params.korime;

    let korisnik = await this._korisnikDao.dohvatiKorisnika(korisnicko_ime);
    if (korisnik == undefined) {
      upravitelj.greska400(odgovor, 'nije moguće pronaći korisnika s tim korisničkim imenom');
      return;
    }

    if (korisnik.tip_korisnika == 'admin') {
      upravitelj.greska400(odgovor, 'nije moguće obrisati admin korisnika');
      return;
    }

    let uspjeh = await this._korisnikDao.obrisiKorisnika(korisnik);
    if (uspjeh) {
      upravitelj.izvrseno201(odgovor);
    } else {
      upravitelj.greska400(odgovor, 'brisanje korisnika nije uspjelo');
    }
  };

  _posaljiEmail = async (korisnik, originalLozinka) => {
    const posiljatelj = 'jmojzes21@student.foi.hr';

    let predmet = 'Moje serije - registracija računa';

    let poruka = 'Poštovani,\n';
    poruka += 'kreiran Vam je račun za web stranicu Moje serije.';
    poruka += ' U nastavku su navedeni podaci za prijavu.\n\n';

    poruka += `Korisničko ime: ${korisnik.korisnicko_ime}\n`;
    poruka += `Lozinka: ${originalLozinka}\n\n`;

    poruka += 'Lijep pozdrav,\n';
    poruka += 'Administrator\n';

    console.log();
    console.log(`Pošalji email`);
    console.log('  pošiljatelj: ' + posiljatelj);
    console.log('  primatelj: ' + korisnik.email);
    console.log('  predmet: ' + predmet);

    console.log('-- SADRŽAJ POČETAK --');
    console.log(poruka);
    console.log('-- SADRŽAJ KRAJ --');

    let uspjeh = await email.posaljiEmail(posiljatelj, korisnik.email, predmet, poruka);
    if (uspjeh) {
      console.log(`Email (${posiljatelj} -> ${korisnik.email}) je uspješno poslan`);
    } else {
      console.log(`Email (${posiljatelj} -> ${korisnik.email}) nije moguće poslati`);
    }
  };
}

module.exports = KorisnikUpravitelj;
