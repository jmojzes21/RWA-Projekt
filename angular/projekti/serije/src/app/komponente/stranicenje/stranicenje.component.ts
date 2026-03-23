import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-stranicenje',
  templateUrl: './stranicenje.component.html',
  styleUrl: './stranicenje.component.scss',
})
export class StranicenjeComponent {
  @Input()
  public stranica: number = 1;

  @Input()
  public ukupnoStranica: number = 1;

  @Output()
  public promjenaStranice = new EventEmitter<number>();

  public promijeniStranicu(novaStranica: number) {
    if (novaStranica < 1) {
      novaStranica = 1;
    } else if (novaStranica > this.ukupnoStranica) {
      novaStranica = this.ukupnoStranica;
    }

    this.promjenaStranice.emit(novaStranica);
  }
}
