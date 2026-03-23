import { Injectable } from '@angular/core';
import { RestService } from './rest.service';

declare let grecaptcha: any;

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  private javniKljuc?: string;

  constructor(private restServis: RestService) {}

  public async izvrsi(akcija: string): Promise<string> {
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(this.javniKljuc, { action: akcija }).then((token: string) => {
          resolve(token);
        });
      });
    });
  }

  public async postavi() {
    let odgovor = await this.restServis.getResurs('/recaptcha_javni_kljuc', {
      potreban_jwt: false,
    });

    this.javniKljuc = odgovor.kljuc;

    let script = document.createElement('script');
    script.setAttribute('src', `https://www.google.com/recaptcha/api.js?render=${this.javniKljuc}`);
    document.head.appendChild(script);
  }
}
