exports.dajGithubAuthUrl = (clientId, povratniUrl) => {
  let url = 'https://github.com/login/oauth/authorize';
  url += `?client_id=${clientId}`;
  url += `&redirect_uri=${povratniUrl}`;

  return url;
};

exports.dajAccessToken = async (clientId, githubTajniKljuc, dobiveniKod) => {
  try {
    let url = 'https://github.com/login/oauth/access_token';
    url += `?client_id=${clientId}`;
    url += `&client_secret=${githubTajniKljuc}`;
    url += `&code=${dobiveniKod}`;

    let odgovor = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });

    if (odgovor.status != 200) {
      return undefined;
    }

    let podaci = await odgovor.json();
    return podaci.access_token;
  } catch (greska) {
    return undefined;
  }
};

exports.provjeriToken = async (token) => {
  try {
    let parametri = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    let url = 'https://api.github.com/user';

    let odgovor = await fetch(url, parametri);

    if (odgovor.status != 200) {
      return undefined;
    }

    let podaci = await odgovor.json();
    return podaci;
  } catch (greska) {
    return undefined;
  }
};
