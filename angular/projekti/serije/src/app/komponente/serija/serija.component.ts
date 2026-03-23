import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-serija',
  templateUrl: './serija.component.html',
  styleUrl: './serija.component.scss',
})
export class SerijaComponent {
  @Input()
  public id: number = 0;

  @Input()
  public naslov: string = '';

  @Input()
  public opis: string = '';

  @Input()
  public slikaUrl?: string = undefined;

  @Output()
  public prikaziDetalje = new EventEmitter<number>();
}
