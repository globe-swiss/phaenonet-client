const { I } = inject();

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
  mapMarker: { css: '[data-test-id=map-marker]' },
  infoWindow: {
    window: { css: '[data-test-id=info-window]' },
    individualImage: { css: '[data-test-id=individual-image]' },
    individualPlaceholder: { css: '[data-test-id=individual-placeholder]' }
  },
  addObjectButton: { css: '.map__map-actions button' },
  dismissButton: { css: 'button.dismissButton' },
  async waitForMarkers(timeout = 10) {
    await I.waitForFunction(
      markerImageUrlPattern => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter(img => img.src.includes(markerImageUrlPattern))
          .every(img => img.complete && img.naturalHeight !== 0);
      },
      ['*/assets/img/map_pins/*'],
      timeout
    );
  }
};
