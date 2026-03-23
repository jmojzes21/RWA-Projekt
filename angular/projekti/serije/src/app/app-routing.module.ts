import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PocetnaComponent } from './stranice/pocetna/pocetna.component';
import { DetaljiSerijeComponent } from './stranice/detalji-serije/detalji-serije.component';
import { PrijavaComponent } from './stranice/prijava/prijava.component';
import { OmiljeneSerijeComponent } from './stranice/omiljene-serije/omiljene-serije.component';
import { ProfilComponent } from './stranice/profil/profil.component';
import { KorisniciComponent } from './stranice/korisnici/korisnici.component';
import { RegistracijaComponent } from './stranice/registracija/registracija.component';
import { DnevnikComponent } from './stranice/dnevnik/dnevnik.component';
import { DokumentacijaComponent } from './stranice/dokumentacija/dokumentacija.component';
import { NemaStraniceComponent } from './stranice/nema-stranice/nema-stranice.component';
import { prijavljeniKorisnikGuard, samoAdminGuard, zabraniGitHubKorisnikuGuard } from './servisi/autorizacija.guard';

const routes: Routes = [
  { path: '', redirectTo: 'pocetna', pathMatch: 'full' },
  {
    path: 'pocetna',
    component: PocetnaComponent,
    canActivate: [prijavljeniKorisnikGuard],
  },
  {
    path: 'detalji_serije',
    component: DetaljiSerijeComponent,
    canActivate: [prijavljeniKorisnikGuard],
  },
  {
    path: 'prijava',
    component: PrijavaComponent,
  },
  {
    path: 'omiljene_serije',
    component: OmiljeneSerijeComponent,
    canActivate: [prijavljeniKorisnikGuard],
  },
  {
    path: 'profil',
    component: ProfilComponent,
    canActivate: [prijavljeniKorisnikGuard, zabraniGitHubKorisnikuGuard],
  },
  {
    path: 'korisnici',
    component: KorisniciComponent,
    canActivate: [samoAdminGuard],
  },
  {
    path: 'registracija',
    component: RegistracijaComponent,
    canActivate: [samoAdminGuard],
  },
  {
    path: 'dnevnik',
    component: DnevnikComponent,
    canActivate: [samoAdminGuard],
  },
  {
    path: 'dokumentacija',
    component: DokumentacijaComponent,
  },
  {
    path: '**',
    component: NemaStraniceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
