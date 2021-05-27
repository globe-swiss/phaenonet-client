module.exports = {
  url(individualId) {
    return `/stations/${individualId}`;
  },
  components: {
    navigation: { css: 'app-nav' }
  }
};
