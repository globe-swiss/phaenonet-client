module.exports = {
  url: '/profile',
  components: {
    navigation: { css: 'app-nav' },
    profile: { css: 'app-profile-details' },
    observations: { css: 'app-observation-list' },
    activities: { css: 'app-activity-list' }
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
  observations: {
    listItems: { css: '[data-test-id=observation-item]' },
    /**
     * @param {number} num
     */
    getItem(num) {
      return locate(this.listItems).at(num);
    },
    withinItem: {
      image: { css: '[data-test-id=observation-item__image]' },
      species: { css: '[data-test-id=observation-item__species]' },
      name: { css: '[data-test-id=observation-item_name]' }
    }
  }
};
