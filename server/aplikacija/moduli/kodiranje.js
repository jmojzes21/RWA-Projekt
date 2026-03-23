const crypto = require('crypto');

exports.kreirajSha256 = (tekst) => {
  let sha256 = crypto.createHash('sha256');
  sha256.write(tekst);
  let rezultat = sha256.digest('base64');
  sha256.end();

  return rezultat;
};

exports.dajNasumicniBroj = (max) => {
  return Math.floor(Math.random() * max);
};

exports.kreirajNasumicniUUID = () => {
  return crypto.randomUUID();
};
