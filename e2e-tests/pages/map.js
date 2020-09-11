const { I } = inject();

module.exports = {
  url: '/map',
  components: {
    navigation: { css: 'app-nav' },
    map: { css: 'google-map' },
    filter: { css: '.map-filter' }
    //actions: { css: '.map-actions' } // not always visible
  },
  filterFields: {
    phenoyear: { css: '.map-filter #form-year .mat-select-value' },
    source: { css: '.map-filter #form-datasource .mat-select-value' },
    species: { css: '.map-filter #form-species .mat-select-value' }
  },
  addObjectButton: { css: '.map-actions button' }
};
