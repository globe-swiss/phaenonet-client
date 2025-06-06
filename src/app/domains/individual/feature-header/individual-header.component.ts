import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { Individual } from '@shared/models/individual.model';
import { map, Observable, ReplaySubject } from 'rxjs';
import { IndividualHeaderActionsComponent } from './individual-header-actions.component';
import { IndividualHeaderGraphComponent } from './individual-header-graph.widget';
import { IndividualHeaderMapComponent } from './individual-header-map.widget';
import { HeaderViews } from './individual-header.model';

@Component({
  selector: 'app-individual-header',
  templateUrl: './individual-header.component.html',
  imports: [IndividualHeaderMapComponent, IndividualHeaderGraphComponent, IndividualHeaderActionsComponent, AsyncPipe]
})
export class IndividualHeaderComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;
  currentView = signal(HeaderViews.Map);

  HeaderViews = HeaderViews;
  hasSensor$: Observable<boolean>;

  ngOnInit(): void {
    this.hasSensor$ = this.individual$.pipe(map(individual => !!individual?.sensor));
  }
}
