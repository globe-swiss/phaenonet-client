module.exports = {
  url: '/map',
  components: {
    navigation: { css: 'app-nav' },
    map: { css: 'google-map' },
    filter: { css: '[data-test-id=filter-component]' },
    actions: { css: '[data-test-id=actions-component]' }
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
    species: {
      dropdown: { css: '[data-test-id=select-species]' },
      values: {
        hazel: 'HS',
        sycamore: 'BA'
        // add more if needed
      }
    }
  },
  mapMarker: { css: 'google-map map-marker' },
  addObjectButton: { css: '.map__map-actions button' },
  dismissButton: { css: 'button.dismissButton' }
};
