import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxScannerQrcodeComponent, ScannerQRCodeConfig, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { AlertService } from 'src/app/messaging/alert.service';
import { Individual } from '../individual';

@Component({
  selector: 'app-individual-connect',
  templateUrl: './individual-connect.component.html',
  styleUrls: ['./individual-connect.component.css']
})
export class IndividualConnectComponent implements OnInit {
  @ViewChild('scanner') scanner: NgxScannerQrcodeComponent;
  public config: ScannerQRCodeConfig = {
    // fps: 1000,
    isAuto: true,
    // isBeep: true,
    // decode: 'macintosh',
    medias: {
      audio: false,
      video: {
        width: window.innerWidth
      }
    }
  };
  private curentDeviceIdx = 0;
  public cameraAvailable: boolean = undefined;

  connectForm = new UntypedFormGroup({
    deveui: new UntypedFormControl('')
  });

  constructor(
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) {}

  ngOnInit(): void {
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then(() => (this.cameraAvailable = true))
      .catch(function (err) {
        this.cameraAvailable = false;
        console.log('GUM failed with error, time diff: ', err);
        alert('Please enable camera access to connect sensors via QR code');
      });
  }

  public onEvent(e: ScannerQRCodeResult[]): void {
    console.log(e);
    if (e.length > 0) {
      this.connect(e[0].value);
    }
  }

  public camera(scanner: any): void {
    const availableDevices = scanner.devices.value;
    this.curentDeviceIdx = (this.curentDeviceIdx + 1) % availableDevices.length;
    scanner.playDevice(availableDevices[this.curentDeviceIdx].deviceId);
    console.log('availableDevices', availableDevices);
    console.log('currentdevice', this.curentDeviceIdx);
  }

  public manual(): void {
    this.cameraAvailable = false;
    this.stopCamera();
  }

  public connect(deveui?: string): void {
    console.log(deveui, this.connectForm.controls.deveui.value.trim().toUpperCase());
    deveui = deveui || this.connectForm.controls.deveui.value.trim().toUpperCase();
    const individual_id = this.route.snapshot.url[0].path;
    if (deveui && deveui.length == 16) {
      this.afs
        .collection<Individual>('individuals')
        .doc<Individual>(individual_id)
        .update({ deveui: deveui, sensor: {} })
        .then(() =>
          this.alertService.infoMessage('Sensor Verbunden', `Objekt ${individual_id} verbunden mit Sensor ${deveui}`)
        )
        .catch(err => {
          this.alertService.infoMessage(
            'Fehler',
            `Fehler beim Verbinden von Object ${individual_id} mit Sensor ${deveui}`
          );
          console.error(err);
        });
      this.stopCamera();
      void this.router.navigate(['..'], { relativeTo: this.route });
    }
  }

  private stopCamera() {
    this.scanner && this.scanner.isStart && this.scanner.stop();
  }
}
