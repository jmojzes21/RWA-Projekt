export function formatirajDatum(datum: Date) {
  let dan = datum.getDate();
  let mjesec = datum.getMonth() + 1;
  let godina = datum.getFullYear();

  return `${dan}.${mjesec}.${godina}`;
}

export function formatirajVrijeme(datum: Date) {
  let sati = datum.getHours().toString();
  let minute = datum.getMinutes().toString();
  let sekunde = datum.getSeconds().toString();

  if (sati.length == 1) sati = '0' + sati;
  if (minute.length == 1) minute = '0' + minute;
  if (sekunde.length == 1) sekunde = '0' + sekunde;

  return `${sati}:${minute}:${sekunde}`;
}

export function formatirajDatumVrijeme(datum: Date) {
  let dan = datum.getDate();
  let mjesec = datum.getMonth() + 1;
  let godina = datum.getFullYear();

  let sati = datum.getHours().toString();
  let minute = datum.getMinutes().toString();
  let sekunde = datum.getSeconds().toString();

  if (sati.length == 1) sati = '0' + sati;
  if (minute.length == 1) minute = '0' + minute;
  if (sekunde.length == 1) sekunde = '0' + sekunde;

  return `${dan}.${mjesec}.${godina} ${sati}:${minute}:${sekunde}`;
}

export function formatirajDatumRest(datum: Date) {
  let dan = datum.getDate().toString();
  let mjesec = (datum.getMonth() + 1).toString();
  let godina = datum.getFullYear().toString();

  if (dan.length == 1) dan = '0' + dan;
  if (mjesec.length == 1) mjesec = '0' + mjesec;

  return `${godina}-${mjesec}-${dan}`;
}

export function formatirajVrijemeRest(vrijeme: Date) {
  return formatirajVrijeme(vrijeme);
}

export function parsirajDatum(datumTekst: string) {
  datumTekst = datumTekst.trim();

  try {
    if (testirajFormatDatuma(datumTekst) == false) {
      return undefined;
    }

    let d = datumTekst.split('.');

    let dan = parseInt(d[0]);
    let mjesec = parseInt(d[1]);
    let godina = parseInt(d[2]);

    return new Date(godina, mjesec - 1, dan);
  } catch {
    return undefined;
  }
}

export function parsirajVrijeme(vrijemeTekst: string) {
  if (testirajFormatVremena(vrijemeTekst) == false) {
    return undefined;
  }

  let d = Date.parse('1970-01-01 ' + vrijemeTekst);
  if (isNaN(d)) {
    return undefined;
  }

  return new Date(d);
}

function testirajFormatVremena(vrijemeTekst: string) {
  let reg = /^(\d{1,2})\:(\d{1,2})(\:\d{1,2})?$/gm;
  return reg.test(vrijemeTekst);
}

function testirajFormatDatuma(datumTekst: string) {
  let reg = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/gm;
  return reg.test(datumTekst);
}
