const { I } = inject();

module.exports = {
  url: '/map',
  components: {
    navigation: { css: 'app-nav' },
    map: { css: 'google-map' },
    filter: { css: '.map-filter' }
    //actions: { css: '.map-actions' } // not always visible
  },
  filter: {
    phenoyear: {
      dropdown: { css: '.map-filter mat-select[formcontrolname=year]' }
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
        sycamore: 'BA'
        // add more if needed
      }
    }
  },
  mapMarker: { css: 'google-map map-marker' },
  addObjectButton: { css: '.map-actions button' },
  visit() {
    I.amOnPage(this.url);
    I.waitForText('2020', 5, this.filter.phenoyear.dropdown); // wait for page to load
  }
};
