import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatisticsFilterService } from './statistics-filter.service';

import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { Phenophase, Species } from '@shared/models/masterdata.model';
import { allType, sourceFilterValues, SourceType } from '@shared/models/source-type.model';
import { Observable, of, Subscription } from 'rxjs';
import { AltitudeGroup, AnalyticsType, selectableAltitudeGroup, selectableAnalyticsTypes } from './common.model';
import { FilterGraphType } from './statistic-filter.model';

@Component({
  selector: 'app-statistics-filter',
  templateUrl: './statistics-filter.component.html',
  //styleUrls: ['./statistics-filter.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatOption,
    MatSelect,
    MatLabel,
    MatFormField,
    MatIcon,
    MatTooltip,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    NgFor,
    AsyncPipe
  ]
})
export class StatisticFilterComponent implements OnInit {
  private subscriptions = new Subscription();
  public translationsLoaded = false;

  filter: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<allType | SourceType>;
    analyticsType: FormControl<AnalyticsType>;
    species: FormControl<string>;
    phenophase: FormControl<string>;
    altitude: FormControl<allType | AltitudeGroup>;
    graph: FormControl<FilterGraphType>;
  }>;

  selectableYears$: Observable<string[]>;
  selectableSources$: Observable<(allType | SourceType)[]>;
  selectableAnalyticsTypes$: Observable<AnalyticsType[]>;
  selectableSpecies$: Observable<Species[]>;
  selectablePhenophases$: Observable<Phenophase[]>;
  selectableAltitudeGroups$: Observable<(allType | AltitudeGroup)[]>;

  constructor(
    private translateService: TranslateService,
    private statisticsFilterService: StatisticsFilterService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // fixme todo check if needed
    // move: takeuntildestroyed?
    // workaround hitting issue with standalone components: https://github.com/angular/components/issues/17839
    this.subscriptions.add(
      this.translateService.get('Alle').subscribe(() => {
        this.translationsLoaded = true;
      })
    );

    // bind filter values to form
    this.subscriptions.add(
      this.statisticsFilterService.currentFilters$.subscribe(cf => {
        this.filter = this.fb.group({
          year: [cf.year],
          datasource: [cf.datasource],
          analyticsType: [cf.analyticsType],
          species: [cf.species],
          phenophase: [cf.phenophase],
          altitude: [cf.altitude],
          graph: [cf.graph]
        });
      })
    );

    // dynamic filters
    this.selectableYears$ = this.statisticsFilterService.getSelectableYears();
    this.selectableSources$ = of(sourceFilterValues);
    this.selectableAnalyticsTypes$ = of(selectableAnalyticsTypes);
    this.selectableSpecies$ = this.statisticsFilterService.getSelectableSpecies();
    this.selectablePhenophases$ = this.statisticsFilterService.getSelectablePhenophases();
    this.selectableAltitudeGroups$ = of(selectableAltitudeGroup);
  }
}
