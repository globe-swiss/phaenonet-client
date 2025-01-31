const profileObservationsComponent = require('../components/profile_observations.js');

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
    observations: profileObservationsComponent.component
  },
  followButton: { css: '[data-test-id=followButton]' },
  unfollowButton: { css: '[data-test-id=unfollowButton]' },
  observations: profileObservationsComponent
};
