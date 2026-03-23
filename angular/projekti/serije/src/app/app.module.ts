import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PocetnaComponent } from './stranice/pocetna/pocetna.component';
import { NavigacijaComponent } from './komponente/navigacija/navigacija.component';
import { DetaljiSerijeComponent } from './stranice/detalji-serije/detalji-serije.component';
import { PrijavaComponent } from './stranice/prijava/prijava.component';
import { FormsModule } from '@angular/forms';
import { PorukaComponent } from './komponente/poruka/poruka.component';
import { SerijaComponent } from './komponente/serija/serija.component';
import { StranicenjeComponent } from './komponente/stranicenje/stranicenje.component';
import { PipaTmdbSlikaPipe } from './pipe/pipa-tmdb-slika.pipe';
import { SezonaSerijeComponent } from './komponente/sezona-serije/sezona-serije.component';
import { OmiljeneSerijeComponent } from './stranice/omiljene-serije/omiljene-serije.component';
import { ProfilComponent } from './stranice/profil/profil.component';
import { KorisniciComponent } from './stranice/korisnici/korisnici.component';
import { PipaSpolKorisnikaPipe } from './pipe/pipa-spol-korisnika.pipe';
import { PipaMojDatumPipe } from './pipe/pipa-moj-datum.pipe';
import { RegistracijaComponent } from './stranice/registracija/registracija.component';
import { DnevnikComponent } from './stranice/dnevnik/dnevnik.component';
import { QrKodComponent } from './komponente/qr-kod/qr-kod.component';
import { DokumentacijaComponent } from './stranice/dokumentacija/dokumentacija.component';
import { NemaStraniceComponent } from './stranice/nema-stranice/nema-stranice.component';

@NgModule({
  declarations: [
    AppComponent,
    PocetnaComponent,
    NavigacijaComponent,
    DetaljiSerijeComponent,
    PrijavaComponent,
    PorukaComponent,
    SerijaComponent,
    StranicenjeComponent,
    PipaTmdbSlikaPipe,
    SezonaSerijeComponent,
    OmiljeneSerijeComponent,
    ProfilComponent,
    KorisniciComponent,
    PipaSpolKorisnikaPipe,
    PipaMojDatumPipe,
    RegistracijaComponent,
    DnevnikComponent,
    QrKodComponent,
    DokumentacijaComponent,
    NemaStraniceComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
