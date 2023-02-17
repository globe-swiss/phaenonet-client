module.exports = {
  /**
   * @param {string} userId
   * @param {string} species
   * @param {number} year
   */
  url(userId, species, year) {
    return `profile/${userId}/species/${species}/year/${year}`;
  },
  components: {
    navigation: { css: 'app-nav' },
    profile: { css: '[data-test-id=individualList]' }
  },
  yearDropdown: { css: '[data-test-id=selectYear]' }
};
