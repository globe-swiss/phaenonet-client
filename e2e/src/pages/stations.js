module.exports = {
  /**
   * @param {string} individualId
   */
  url(individualId) {
    return `/stations/${individualId}`;
  },
  components: {
    navigation: { css: 'app-nav' }
  }
};
