import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

// https://github.com/davidshimjs/qrcodejs
declare let QRCode: any;

@Component({
  selector: 'app-qr-kod',
  templateUrl: './qr-kod.component.html',
  styleUrl: './qr-kod.component.scss',
})
export class QrKodComponent implements OnChanges {
  @Input()
  public sadrzaj?: string = undefined;

  @ViewChild('qrdiv')
  public qrDivRef?: ElementRef<HTMLDivElement>;

  public ngOnChanges(changes: SimpleChanges) {
    if (this.sadrzaj == undefined) {
      this.sakrij();
    } else {
      this.prikazi(this.sadrzaj);
    }
  }

  private prikazi(tekst: string) {
    let element = this.qrDivRef?.nativeElement;

    if (element != undefined) {
      element.innerHTML = '';

      new QRCode(element, {
        text: tekst,
        width: 512,
        height: 512,
        correctLevel: QRCode.CorrectLevel.L,
      });
    }
  }

  private sakrij() {
    let element = this.qrDivRef?.nativeElement;

    if (element != undefined) {
      element.innerHTML = '';
    }
  }
}
