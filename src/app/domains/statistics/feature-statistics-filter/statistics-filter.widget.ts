import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatisticsFilterService } from '../shared/statistics-filter.service';

import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { LanguageService } from '@core/services/language.service';
import { allType, allValue, SourceType, sourceValues, TranslatableFilterType } from '@shared/models/source-type.model';
import { Observable, of, Subscription } from 'rxjs';
import { AltitudeGroup, AnalyticsType } from '../shared/statistics-common.model';
import { altitudeGroupValues, FilterGraphType } from '../shared/statistics-filter.model';

@Component({
  selector: 'app-statistics-filter',
  templateUrl: './statistics-filter.widget.html',
  styleUrls: ['./statistics-filter.widget.scss'],
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
    MatIconButton,
    MatTooltip,
    AsyncPipe
  ]
})
export class StatisticFilterComponent implements OnInit {
  private subscriptions = new Subscription();

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
  selectableSpecies$: Observable<TranslatableFilterType[]>;
  selectablePhenophases$: Observable<TranslatableFilterType[]>;
  selectableAltitudeGroups$: Observable<(allType | AltitudeGroup)[]>;

  constructor(
    private translateService: TranslateService,
    private languageService: LanguageService,
    private statisticsFilterService: StatisticsFilterService,
    private fb: FormBuilder
  ) {
    this.filter = this.fb.group({
      year: [],
      datasource: [],
      analyticsType: [],
      species: [],
      phenophase: [],
      altitude: [],
      graph: []
    });
  }

  ngOnInit() {
    // bind filter values to form
    this.subscriptions.add(
      this.statisticsFilterService.currentFilters$.subscribe(cf => {
        this.filter.setValue({
          year: cf.year,
          datasource: cf.datasource,
          analyticsType: cf.analyticsType,
          species: cf.species,
          phenophase: cf.phenophase,
          altitude: cf.altitude,
          graph: cf.graph
        });
      })
    );

    this.subscriptions.add(
      this.filter.valueChanges.subscribe(value => {
        this.statisticsFilterService.updateFilters(value);
      })
    );

    // dynamic filters
    this.selectableYears$ = this.statisticsFilterService.getSelectableYears();
    this.selectableSources$ = of([allValue, ...sourceValues]);
    this.selectableAnalyticsTypes$ = this.statisticsFilterService.getSelectableAnalyticsTypes();
    this.selectableSpecies$ = this.statisticsFilterService.getSelectableSpecies();
    this.selectablePhenophases$ = this.statisticsFilterService.getSelectablePhenophases();
    this.selectableAltitudeGroups$ = of([allValue, ...altitudeGroupValues]);
  }
}
