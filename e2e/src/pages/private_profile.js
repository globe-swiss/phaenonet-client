const profileObservationsComponent = require('../components/profile_observations.js');

module.exports = {
  url: '/profile',
  components: {
    navigation: { css: 'app-nav' },
    profile: { css: 'app-profile-details' },
    observations: profileObservationsComponent.component,
    activities: { css: 'app-activity' }
  },
  profile: {
    title: { css: 'app-profile-details [data-test-id=profile-details-title]' },
    nickname: { css: 'app-profile-details [data-test-id=profile-details-nickname]' },
    name: { css: 'app-profile-details [data-test-id=profile-details-firstname]' },
    surname: { css: 'app-profile-details [data-test-id=profile-details-lastname]' },
    email: { css: 'app-profile-details [data-test-id=profile-details-email]' },
    language: { css: 'app-profile-details [data-test-id=profile-details-locale]' },
    profileLinkButton: { css: 'app-profile-details [data-test-id=profile-details-link-button]' },
    profileEditButton: { css: 'app-profile-details [data-test-id=profile-details-edit-button]' },
    logoutButton: { css: 'app-profile-details [data-test-id=profile-details-logout-button]' }
  },
  observations: profileObservationsComponent
};
