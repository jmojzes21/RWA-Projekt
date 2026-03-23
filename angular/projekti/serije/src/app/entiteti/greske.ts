export class Greska {
  public poruka: string;
  public kod: number;

  constructor(poruka: string, kod: number = 0) {
    this.poruka = poruka;
    this.kod = kod;
  }

  private static _od(nesto: any): Greska {
    if (nesto != undefined) {
      if (typeof nesto == 'string') {
        return new Greska(nesto);
      }

      let poruka = nesto.poruka;
      if (poruka != undefined) {
        return new Greska(poruka);
      }
    }

    return new Greska('Nepoznata greška');
  }

  public static od(nesto: any): Greska {
    let greska = this._od(nesto);
    console.error(greska.poruka);
    return greska;
  }
}
