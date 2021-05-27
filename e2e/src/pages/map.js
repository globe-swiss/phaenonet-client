module.exports = {
  url: '/map',
  components: {
    navigation: { css: 'app-nav' },
    map: { css: 'google-map' },
    filter: { css: '.map-filter' },
    actions: { css: '.map-actions' }
  },
  filter: {
    phenoyear: {
      dropdown: { css: '.map-filter mat-select[formcontrolname=year]' },
      placeholder: { css: '.map-filter mat-select[formcontrolname=year] .mat-select-placeholder' }
    },
    source: {
      dropdown: { css: '.map-filter mat-select[formcontrolname="datasource"]' },
      options: {
        all: 'all',
        phenonet: 'globe',
        meteoswiss: 'meteoswiss'
      }
    },
    species: {
      dropdown: { css: '.map-filter mat-select[formcontrolname="species"]' },
      options: {
        hazel: 'HS',
        sycamore: 'BA'
        // add more if needed
      }
    }
  },
  mapMarker: { css: 'google-map map-marker' },
  addObjectButton: { css: '.map-actions button' },
  dismissButton: { css: 'button.dismissButton' }
};
