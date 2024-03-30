import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
})
export class ContractsComponent implements OnInit {
  editModal: boolean = false;
  contractForm = this._fb.group({
    date: [new Date()],
    address: [
      ` والكائن مقرها فيلا
    208
    ،محور محمد نجيب , قسم التجمع الأول , القاهرة الجديدة`,
    ],
  });

  constructor(private _fb: FormBuilder) {}
  ngOnInit(): void {}

  @ViewChild('download_container') download_container!: ElementRef;

  pdfDownload() {
    setTimeout(() => {
      const cards = this.download_container.nativeElement.querySelectorAll('.card');
      const canvasPromises:any[] = [];

      cards.forEach((card:any) => {
        canvasPromises.push(html2canvas(card));
      });

      Promise.all(canvasPromises).then((canvases) => {
        const pdf = new jsPDF('p', 'px', 'a4');
        canvases.forEach((canvas, index) => {
          const imgData = canvas.toDataURL('image/jpeg');
          pdf.addImage(imgData, 'JPG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
          if (index !== canvases.length - 1) {
            pdf.addPage();
          }
        });

        pdf.save(this.generateRandomString(16));
      }).catch((error) => {
        console.error('Error generating PDF:', error);
      });
    }, 1);
  }

  generateRandomString(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      this.editModal = false;
    }
  }
}
