import { Injectable } from '@angular/core';
import { MasterdataService } from '@shared/services/masterdata.service';
import { BehaviorSubject, debounceTime, first, map, startWith, switchMap, tap } from 'rxjs';
import { allowedPhenophases, allPhenophases, allSpecies, allYear, forbiddenSpecies } from './common.model';
import { DEFAULT_FILTERS, StatisticFilters } from './statistic-filter.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsFilterService {
  // fixme/todo refactor to use Singnal
  private filtersSubject = new BehaviorSubject<StatisticFilters>(DEFAULT_FILTERS);
  currentFilters$ = this.filtersSubject.asObservable().pipe(debounceTime(300));

  constructor(private masterdataService: MasterdataService) {
    this.initPhenoyear();
  }

  private initPhenoyear() {
    this.masterdataService.phenoYear$.pipe(first()).subscribe(year => this.updateFilters({ year: String(year) }));
  }

  private updateFilters(update: Partial<StatisticFilters>): void {
    this.filtersSubject.next({
      ...this.filtersSubject.getValue(),
      ...update
    });
  }

  forceRedraw(): void {
    this.filtersSubject.next(this.filtersSubject.getValue());
  }

  /**
   * Return observable selectable species based on the selected filters.
   * All adjustments to invalid filter combinations need to be done here.
   * TODO split logic in get species and adjust filters
   */
  getSelectableSpecies() {
    return this.filtersSubject.pipe(
      startWith(''),
      switchMap(() => this.masterdataService.getSpecies()), // get all species from masterdata
      map(species => species.filter(s => !forbiddenSpecies.has(s.id))), // filter out forbidden species
      map(species => {
        // filter species by datasource
        const filterDatasource = this.filtersSubject.getValue().datasource;
        const filterSpecies = this.filtersSubject.getValue().species;
        if (filterDatasource == 'all') {
          return species;
        } else {
          // set all species if current species filter if invalid
          if (
            filterSpecies != allSpecies.id &&
            species.filter(s => s.id == filterSpecies && s.sources.includes(filterDatasource)).length == 0
          ) {
            this.updateFilters({ species: allSpecies.id });
          }
          // return species that are available for the selected datasource
          return species.filter(s => s.sources.includes(filterDatasource));
        }
      }),
      map(species => this.masterdataService.sortTranslatedMasterData(species)), // sort by translation
      map(species => [allSpecies].concat(species)), // add all species to selection
      // set to valid species if analytics type is 'altitude' and 'all' species is selected
      tap(species => {
        const filterAnalyticsType = this.filtersSubject.getValue().analyticsType;
        const filterSpecies = this.filtersSubject.getValue().species;
        const filterYear = this.filtersSubject.getValue().year;
        const filterGraph = this.filtersSubject.getValue().graph;
        // set species to first valid species if 'all' species is selected with incompatible other filters
        if (
          filterSpecies === allSpecies.id &&
          (filterAnalyticsType === 'altitude' || filterYear === allYear || filterGraph === 'yearly')
        ) {
          this.updateFilters({ species: species[1].id });
        }

        // set analytics type to 'species' if 'all' years and 'altitude' is selected. Altitude is not allowed for all years.
        if (filterYear === allYear && filterAnalyticsType === 'altitude') {
          this.updateFilters({ analyticsType: 'species' });
        }
      })
      // todo check if this is still needed - changes should already be triggered on updateFilters
      //tap(() => this.drawingService.triggerRedraw())
    );
  }

  /**
   * returns observable selectable phenophases based on the selected species.
   */
  getSelectablePhenophases() {
    return this.filtersSubject.pipe(
      // todo check logic change. this is now triggered on every change! not only on species changes
      switchMap(filterValues => this.masterdataService.getPhenophases(filterValues.species)),
      map(phenophases => phenophases.filter(p => allowedPhenophases.has(p.id))), // remove invalid phenophases
      map(phenophases => [allPhenophases].concat(phenophases)) // add all phenophases to selection
    );
  }

  /**
   *
   * returns observable selectable years based on masterdata and the selected graph type.
   */
  getSelectableYears() {
    const filterGraph = this.filtersSubject.getValue().graph;
    return this.masterdataService.availableYears$.pipe(
      //tap(years => (this.availableYears = years)),
      // add all years if yearly graph is selected and convert years to string
      map(years => [...(filterGraph === 'yearly' ? [allYear] : []), ...years.map(String)])
    );
  }
}
