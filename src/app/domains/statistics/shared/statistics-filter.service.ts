import { Injectable } from '@angular/core';
import { allTranslatableFilterValue, allValue } from '@shared/models/source-type.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, first, map, switchMap, tap } from 'rxjs';
import {
  allowedPhenophases,
  analyticsTypesValues,
  DEFAULT_FILTERS,
  forbiddenSpecies,
  StatisticFilters
} from './statistics-filter.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsFilterService {
  private filtersSubject = new BehaviorSubject<StatisticFilters>(DEFAULT_FILTERS);
  currentFilters$ = this.filtersSubject.asObservable().pipe(
    debounceTime(100),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );

  constructor(private masterdataService: MasterdataService) {
    this.initPhenoyear();
  }

  private initPhenoyear() {
    this.masterdataService.phenoYear$.pipe(first()).subscribe(year => this.updateFilters({ year: String(year) }));
  }

  /**
   * Updates filters in the service.
   * @param update
   */
  public updateFilters(update: Partial<StatisticFilters>): void {
    this.filtersSubject.next({
      ...this.filtersSubject.getValue(),
      ...update
    });
  }

  /**
   * Return observable selectable species based on the selected filters.
   */
  getSelectableSpecies() {
    return this.filtersSubject.pipe(
      // get all species from masterdata
      switchMap(() => this.masterdataService.getSpecies()),
      // filter out forbidden species
      map(species => species.filter(s => !forbiddenSpecies.has(s.id))),
      // filter species by datasource
      map(species => {
        const filterDatasource = this.filtersSubject.getValue().datasource;
        return filterDatasource === allValue ? species : species.filter(s => s.sources.includes(filterDatasource));
      }),
      // sort by translation
      map(species => this.masterdataService.sortTranslatedMasterData(species)),
      // add all species to the selection when needed
      map(species => {
        const { analyticsType, year, graph } = this.filtersSubject.getValue();
        return analyticsType !== 'altitude' && year !== allValue && graph !== 'weekly'
          ? [allTranslatableFilterValue, ...species]
          : species;
      }),
      // set species to first valid species current selection is not selectable
      tap(species => {
        if (!species.some(s => s.id === this.filtersSubject.getValue().species)) {
          this.updateFilters({ species: species[0].id });
        }
      })
    );
  }

  /**
   * returns observable selectable phenophases based on the selected species.
   */
  getSelectablePhenophases() {
    return this.filtersSubject.pipe(
      map(filterValues => filterValues.species),
      // only update if species changes
      distinctUntilChanged(),
      // get phenophases for selected species
      switchMap(species => this.masterdataService.getPhenophases(species)),
      // remove invalid phenophases
      map(phenophases => phenophases.filter(p => allowedPhenophases.has(p.id))),
      // add all phenophases to selection
      map(phenophases => [allTranslatableFilterValue].concat(phenophases)),
      tap(phenophases => {
        // set phenophase to first valid phenophase if current selection is not selectable
        if (!phenophases.some(p => p.id === this.filtersSubject.getValue().phenophase)) {
          this.updateFilters({ phenophase: phenophases[0].id });
        }
      })
    );
  }

  /**
   * returns observable selectable years based on masterdata and the selected graph type.
   */
  getSelectableYears() {
    return combineLatest([this.filtersSubject, this.masterdataService.availableYears$]).pipe(
      // add all years if yearly graph is selected and convert years to string
      map(([filters, years]) => [...(filters.graph === 'yearly' ? [allValue] : []), ...years.map(String)]),
      tap(years => this.updateInvalidFilter('year', years))
    );
  }

  getSelectableAnalyticsTypes() {
    return this.filtersSubject.pipe(
      map(filterValues =>
        filterValues.year === allValue ? analyticsTypesValues.filter(v => v !== 'altitude') : analyticsTypesValues
      ),
      tap(analyticsTypes => this.updateInvalidFilter('analyticsType', analyticsTypes))
    );
  }

  /**
   * Update invalid filter values to the first valid value.
   * @param filter current filter value
   * @param validValues valid values for the filter
   */
  private updateInvalidFilter(filter: keyof StatisticFilters, validValues: string[]): void {
    if (!validValues.includes(this.filtersSubject.getValue()[filter])) {
      this.updateFilters({ [filter]: validValues[0] });
    }
  }
}
