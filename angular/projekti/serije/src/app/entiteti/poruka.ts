export class Poruka {
  constructor(public tekst: string, public klasa: 'poruka-uspjeh' | 'poruka-greska') {}

  static greska(tekst: string) {
    return new Poruka(tekst, 'poruka-greska');
  }

  static uspjeh(tekst: string) {
    return new Poruka(tekst, 'poruka-uspjeh');
  }
}
