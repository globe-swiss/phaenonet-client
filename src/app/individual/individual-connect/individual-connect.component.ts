import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
  @ViewChild('action') action: NgxScannerQrcodeComponent;
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
  public cameraAvailable = false;

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
        console.log('GUM failed with error, time diff: ', err);
        alert('Please enable camera access to connect sensors via QR code');
      });
  }

  public onEvent(e: ScannerQRCodeResult[]): void {
    console.log(e);
    if (e.length > 0) {
      const deveui = e[0].value;
      const individual_id = this.route.snapshot.url[0].path;
      console.log(individual_id);
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
      this.action.stop();
      void this.router.navigate(['..'], { relativeTo: this.route });
    }
  }

  public handle(action: any, fn: string): void {
    action[fn]().subscribe(console.log, alert);
  }

  public camera(action: any): void {
    const availableDevices = action.devices.value;
    this.curentDeviceIdx = (this.curentDeviceIdx + 1) % availableDevices.length;
    action.playDevice(availableDevices[this.curentDeviceIdx]);
    console.log('availableDevices', availableDevices);
    console.log('currentdevice', this.curentDeviceIdx);
  }
}
