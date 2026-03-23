let dateFormatModul;

import('dateformat').then((modul) => {
  dateFormatModul = modul;
});

exports.formatirajDatum = (datum, format) => {
  return dateFormatModul.default(datum, format);
};

exports.parsirajDatum = (datumTekst) => {
  let reg = /^(\d{4})\-(\d{2})\-(\d{2})$/gm;
  if (reg.test(datumTekst) == false) return undefined;

  let d = Date.parse(datumTekst);
  if (isNaN(d)) {
    return undefined;
  }

  return new Date(d);
};

exports.parsirajVrijeme = (vrijemeTekst) => {
  let reg = /^(\d{1,2})\:(\d{1,2})(\:\d{1,2})?$/gm;
  if (reg.test(vrijemeTekst) == false) return undefined;

  let d = Date.parse('1970-01-01 ' + vrijemeTekst);
  if (isNaN(d)) {
    return undefined;
  }

  return new Date(d);
};
