const kodiranje = require('./kodiranje.js');
const totp = require('totp-generator');
const crypto = require('crypto');
const base32 = require('base32-encoding');

class Totp {
  static algoritam = 'SHA-512';
  static znamenke = 6;
  static period = 60;

  static kreirajTajniKljuc = () => {
    let uuid = '';
    for (let i = 0; i < 20; i++) {
      uuid += kodiranje.kreirajNasumicniUUID();
    }

    let sha256 = crypto.createHash('sha256');
    sha256.write(uuid);
    let hash = sha256.digest('hex');
    sha256.end();

    let tajniKljuc = base32.stringify(hash, 'ABCDEFGHIJKLMNOPRSTQRYWXZ234567');
    return tajniKljuc.toUpperCase();
  };

  static generirajKod = (tajniKljuc) => {
    let kod = totp(tajniKljuc, {
      digits: Totp.znamenke,
      algorithm: Totp.algoritam,
      period: Totp.period,
    });

    return kod;
  };
}

module.exports = Totp;
