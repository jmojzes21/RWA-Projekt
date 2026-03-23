const JwtToken = require('../moduli/jwt.js');

exports.parsiraj = (oznaka) => {
  if (oznaka == undefined) return undefined;

  if (typeof oznaka == 'number') {
    return oznaka.toString();
  }

  if (typeof oznaka == 'boolean') {
    return oznaka.toString();
  }

  if (typeof oznaka == 'string') {
    oznaka = oznaka.trim();
    if (oznaka == '') return undefined;

    return oznaka;
  }

  return undefined;
};

exports.dajKorisnikaIzSesije = (zahtjev) => {
  let korisnik = zahtjev.session.korisnik;
  let tip = zahtjev.session.tip;

  if (korisnik == undefined) {
    return undefined;
  }

  if (tip == undefined) {
    tip = '';
  }

  return {
    korisnicko_ime: korisnik,
    tip_korisnika: tip,
  };
};

exports.dajSadrzajTokena = (zahtjev, tajniKljucJwt) => {
  let auth = zahtjev.headers.authorization;
  if (auth == undefined) {
    return undefined;
  }

  let dijelovi = auth.split(' ');
  if (dijelovi.length != 2) return undefined;
  if (dijelovi[0] != 'Bearer') return undefined;

  let token = new JwtToken(dijelovi[1]);
  return token.sadrzaj(tajniKljucJwt);
};

exports.dajPrijavljenogKorisnika = (zahtjev, tajniKljucJwt) => {
  let sadrzajTokena = this.dajSadrzajTokena(zahtjev, tajniKljucJwt);

  if (sadrzajTokena == undefined) {
    return undefined;
  }

  let korisnicko_ime = sadrzajTokena.korisnik;
  let tip_korisnika = sadrzajTokena.tip;

  return { korisnicko_ime, tip_korisnika };
};

exports.nijeImplementirano501 = (zahtjev, odgovor) => {
  odgovor.status(501);
  odgovor.json({ opis: 'metoda nije implementirana' });
};

exports.potrebnaPrijava401 = (odgovor) => {
  odgovor.status(401);
  odgovor.json({ opis: 'potrebna prijava' });
};

exports.zabranjenPristupAdmin403 = (odgovor) => {
  odgovor.status(403);
  odgovor.json({ opis: 'zabranjen pristup' });
};

exports.zabranjenPristup401 = (odgovor) => {
  odgovor.status(401);
  odgovor.json({ opis: 'zabranjen pristup' });
};

exports.izvrseno201 = (odgovor, tijelo = {}) => {
  odgovor.status(201);
  tijelo.opis = 'izvrseno';
  odgovor.json(tijelo);
};

exports.greska400 = (odgovor, opis = 'nepoznata greška') => {
  odgovor.status(400);
  odgovor.json({ opis: opis });
};

exports.zabranjeno405 = (odgovor) => {
  odgovor.status(405);
  odgovor.json({ opis: 'zabranjeno' });
};

exports.nemaResursa404 = (odgovor) => {
  odgovor.status(404);
  odgovor.json({ opis: 'nema resursa' });
};

exports.neocekivaniPodaci = (odgovor) => {
  odgovor.status(417);
  odgovor.json({ opis: 'neočekivani podaci' });
};

exports.recaptchaNeuspjeh = (odgovor) => {
  odgovor.status(400);
  odgovor.json({ opis: 'recaptcha provjera nije uspjela' });
};

exports.potrebnaPrijava401Html = (odgovor) => {
  odgovor.redirect('/prijava');
};

exports.zabranjenPristupAdmin403Html = (odgovor) => {
  odgovor.status(403);
  odgovor.send(`<h1>Zabranjen pristup</h1><a href="/">Početna</a>`);
};
