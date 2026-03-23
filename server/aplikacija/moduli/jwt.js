const jwt = require('jsonwebtoken');

class JwtToken {
  _token;

  constructor(token) {
    this._token = token;
  }

  sadrzaj = (tajniKljucJWT) => {
    try {
      return jwt.verify(this._token, tajniKljucJWT);
    } catch (greska) {
      return undefined;
    }
  };

  token = () => this._token;

  static kreiraj = (podaci, tajniKljucJWT, jwtValjanost) => {
    let token = jwt.sign(podaci, tajniKljucJWT, {
      expiresIn: jwtValjanost + 's',
    });
    return new JwtToken(token);
  };
}

module.exports = JwtToken;
