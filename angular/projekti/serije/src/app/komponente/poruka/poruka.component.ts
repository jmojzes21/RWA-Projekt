import { Component, Input } from '@angular/core';
import { Poruka } from '../../entiteti/poruka';

@Component({
  selector: 'app-poruka',
  templateUrl: './poruka.component.html',
  styleUrl: './poruka.component.scss',
})
export class PorukaComponent {
  @Input()
  public poruka?: Poruka = undefined;
}
