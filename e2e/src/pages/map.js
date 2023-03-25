module.exports = {
  url: '/map',
  components: {
    navigation: { css: 'app-nav' },
    map: { css: 'google-map' },
    filter: { css: '.map-overview__map-filter' },
    actions: { css: '.map-overview__map-actions' }
  },
  filter: {
    phenoyear: {
      dropdown: { css: '.map-overview__map-filter mat-select[formcontrolname=year]' },
      placeholder: { css: '.map-overview__map-filter mat-select[formcontrolname=year] .mat-select-placeholder' }
    },
    source: {
      dropdown: { css: '.map-overview__map-filter mat-select[formcontrolname="datasource"]' },
      values: {
        all: 'all',
        phenonet: 'globe',
        meteoswiss: 'meteoswiss'
      }
    },
    species: {
      dropdown: { css: '.map-overview__map-filter mat-select[formcontrolname="species"]' },
      values: {
        hazel: 'HS',
        sycamore: 'BA'
        // add more if needed
      }
    }
  },
  mapMarker: { css: 'google-map map-marker' },
  addObjectButton: { css: '.map-overview__map-actions button' },
  dismissButton: { css: 'button.dismissButton' }
};
