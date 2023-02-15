module.exports = {
  /**
   * @param {string} individualId
   */
  url(individualId) {
    return `/stations/${individualId}`;
  },
  components: {
    navigation: { css: 'app-nav' },
    header: { css: 'app-individual-header[mode=detail]' },
    description: { css: '[data-test-id=station-description]' },
    observations: { css: '[data-test-id=station-observations]' }
  }
};
