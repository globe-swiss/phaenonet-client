module.exports = {
  url: '/statistics',
  components: {
    navigation: { css: 'app-nav' },
    statistics: { css: '[data-test-id=statistics-component]' }
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
    analyticstype: {
      dropdown: { css: '[data-test-id=select-analyticstype]' },
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
    },
    phenophase: {
      dropdown: { css: '[data-test-id=select-phenophase]' },
      values: {
        BLA: 'BLA'
        // add more if needed
      }
    },
    altgrp: {
      dropdown: { css: '[data-test-id=select-altgrp]' },
      values: {
        all: 'all',
        alt1: 'alt1',
        alt2: 'alt2',
        alt3: 'alt3',
        alt4: 'alt4',
        alt5: 'alt5'
      }
    },
    graphtype: {
      dropdown: { css: '[data-test-id=select-graphtype]' },
      values: {
        yearly: 'yearly',
        weekly: 'weekly'
      }
    }
  },
  quantilbar: { css: 'rect' },
  label: { css: 'text' }
};
