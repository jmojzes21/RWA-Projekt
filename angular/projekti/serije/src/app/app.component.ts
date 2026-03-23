import { Component, OnInit } from '@angular/core';
import { AutentifikacijaService } from './servisi/autentifikacija.service';
import { RecaptchaService } from './servisi/recaptcha.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public provjeravanjeSesije = true;

  constructor(private autentifikacijaServis: AutentifikacijaService, private recaptchaServis: RecaptchaService) {}

  public async ngOnInit() {
    this.recaptchaServis.postavi();

    await this.autentifikacijaServis.dohvatiPrijavljenogKorisnika();
    this.provjeravanjeSesije = false;
  }
}
