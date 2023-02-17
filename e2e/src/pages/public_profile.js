module.exports = {
  /**
   * @param {string} userId
   */
  url(userId) {
    return `/profile/${userId}`;
  },
  components: {
    navigation: { css: 'app-nav' },
    profile: { css: 'app-profile-public' },
    observations: { css: 'app-observation-list' }
  },
  yearDropdown: { css: 'app-observation-list [data-test-id=selectYear]' },
  followButton: { css: '[data-test-id=followButton]' },
  unfollowButton: { css: '[data-test-id=unfollowButton]' }
};
