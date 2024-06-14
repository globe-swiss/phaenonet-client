module.exports = {
  url: '/statistics',
  components: {
    navigation: { css: 'app-nav' },
    statistics: { css: '[data-test-id=statistics-overview-component]' }
  },
  filter: {
    phenoyear: {
      dropdown: { css: '[data-test-id=select-year]' }
    },
    source: {
      dropdown: { css: '[data-test-id=select-source]' },
      values: {
        all: 'all',
        phenonet: 'globe',
        meteoswiss: 'meteoswiss'
      }
    },
    type: {
      dropdown: { css: '[data-test-id=select-analyticsType]' },
      values: {
        species: 'species',
        altitude: 'altitude'
      }
    },
    species: {
      dropdown: { css: '[data-test-id=select-species]' },
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
