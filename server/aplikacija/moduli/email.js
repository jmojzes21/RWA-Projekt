const nodemailer = require('nodemailer');

let mailer = nodemailer.createTransport({
  host: 'mail.foi.hr',
  port: 25,
});

exports.posaljiEmail = async (salje, primatelj, predmet, poruka) => {
  try {
    await mailer.sendMail({
      from: salje,
      to: primatelj,
      subject: predmet,
      text: poruka,
    });
    return true;
  } catch (greska) {
    return false;
  }
};
