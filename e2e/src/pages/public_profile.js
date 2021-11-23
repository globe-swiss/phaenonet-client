module.exports = {
  url(userId) {
    return `/profile/${userId}`;
  },
  components: {
    navigation: { css: 'app-nav' },
    profile: { css: 'app-profile-public' },
    observations: { css: 'app-observation-list' }
  }
};
