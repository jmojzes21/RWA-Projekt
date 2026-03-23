import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutentifikacijaService } from './autentifikacija.service';

export const prijavljeniKorisnikGuard: CanActivateFn = async (route, state) => {
  let auth = inject(AutentifikacijaService);
  let ruter = inject(Router);

  let korisnik = await auth.dohvatiPrijavljenogKorisnika();

  if (korisnik == undefined) {
    ruter.navigateByUrl('/prijava');
    return false;
  }

  return true;
};

export const samoAdminGuard: CanActivateFn = async (route, state) => {
  let auth = inject(AutentifikacijaService);
  let ruter = inject(Router);

  let korisnik = await auth.dohvatiPrijavljenogKorisnika();

  if (korisnik == undefined) {
    ruter.navigateByUrl('/prijava');
    return false;
  }

  if (korisnik.tip_korisnika != 'admin') {
    ruter.navigateByUrl('/zabrana');
    return false;
  }

  return true;
};

export const zabraniGitHubKorisnikuGuard: CanActivateFn = async (route, state) => {
  let auth = inject(AutentifikacijaService);
  let ruter = inject(Router);

  let korisnik = await auth.dohvatiPrijavljenogKorisnika();
  if (korisnik?.tip_korisnika == 'github') {
    ruter.navigateByUrl('/zabrana');
    return false;
  }

  return true;
};
