import { Component, output, signal } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HeaderViews } from './individual-header.model';

@Component({
  selector: 'app-individual-header-actions',
  templateUrl: './individual-header-actions.component.html',
  styleUrls: ['./individual-header-actions.component.scss'],
  imports: [MatIcon, MatFabButton],
  standalone: true
})
export class IndividualHeaderActionsComponent {
  HeaderViews = HeaderViews;
  headerViewSelected = signal<HeaderViews>(HeaderViews.Map);
  onSelectView = output<HeaderViews>();

  onHeaderViewSelect(type: HeaderViews) {
    this.headerViewSelected.set(type);
    this.onSelectView.emit(type);
  }
}
