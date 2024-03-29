module.exports = {
  url: '/statistics',
  components: {
    navigation: { css: 'app-nav' },
    statistics: { css: 'div .statistics-overview' }
  },
  filter: {
    phenoyear: {
      dropdown: { css: '.statistics-filter mat-select[formcontrolname=year]' }
    },
    source: {
      dropdown: { css: '.statistics-filter mat-select[formcontrolname="datasource"]' },
      values: {
        all: 'all',
        phenonet: 'globe',
        meteoswiss: 'meteoswiss'
      }
    },
    type: {
      dropdown: { css: '.statistics-filter mat-select[formcontrolname="analyticsType"]' },
      values: {
        species: 'species',
        altitude: 'altitude'
      }
    },
    species: {
      dropdown: { css: '.statistics-filter mat-select[formcontrolname="species"]' },
      values: {
        hazel: 'HS',
        sycamore: 'BA'
        // add more if needed
      }
    }
  },
  quantilbar: { css: 'rect' },
  label: { css: 'text' }
};
