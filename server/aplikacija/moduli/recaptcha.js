exports.provjeriRecaptchu = async (akcija, tajniKljucCaptcha, recaptchaToken) => {
  if (recaptchaToken == undefined) return false;

  let url = 'https://www.google.com/recaptcha/api/siteverify';

  url += `?secret=${tajniKljucCaptcha}`;
  url += `&response=${recaptchaToken}`;

  try {
    let odgovor = await fetch(url, {
      method: 'POST',
    });

    let podaci = await odgovor.json();

    if (podaci.success == false) {
      return false;
    }

    if (podaci.action != akcija) {
      return false;
    }

    if (podaci.score < 0.7) {
      return false;
    }
  } catch (greska) {
    return false;
  }

  return true;
};
