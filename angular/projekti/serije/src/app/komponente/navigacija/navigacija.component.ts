import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { StavkaNavigacije } from '../../entiteti/stavke_navigacije';
import { AutentifikacijaService } from '../../servisi/autentifikacija.service';
import { PrijavljeniKorisnik } from '../../entiteti/korisnik';
import { AutorizacijaService } from '../../servisi/autorizacija.service';

@Component({
  selector: 'app-navigacija',
  templateUrl: './navigacija.component.html',
  styleUrl: './navigacija.component.scss',
})
export class NavigacijaComponent implements OnInit {
  public prijavljeniKorisnik?: PrijavljeniKorisnik = undefined;
  public stavkeNavigacije: Array<StavkaNavigacije> = [];

  constructor(private autentifikacijaServis: AutentifikacijaService, private autorizacijaServis: AutorizacijaService, private ruter: Router) {}

  public ngOnInit() {
    this.prijavljeniKorisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();
    this.stavkeNavigacije = this.autorizacijaServis.dajStavkeNavigacije();

    this.ruter.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.prijavljeniKorisnik = this.autentifikacijaServis.dajPrijavljenogKorisnika();
        this.stavkeNavigacije = this.autorizacijaServis.dajStavkeNavigacije();
      }
    });
  }

  public async odjaviSe() {
    await this.autentifikacijaServis.odjaviSe();
    this.prijavljeniKorisnik = undefined;
    this.stavkeNavigacije = [];

    this.ruter.navigateByUrl('/prijava');
  }
}
