module.exports = {
  url: '/profile',
  components: {
    navigation: { css: 'app-nav' },
    profile: { css: 'app-profile-details' },
    observations: { css: 'app-observation-list' },
    activities: { css: 'app-activity-list' }
  },
  profile: {
    title: { css: 'app-profile-details .detail-left h3' },
    nickname: { css: 'app-profile-details .detail-right .title-nickname' },
    name: { css: 'app-profile-details .detail-right :nth-child(4)' },
    surname: { css: 'app-profile-details .detail-right :nth-child(6)' },
    email: { css: 'app-profile-details .detail-right :nth-child(8)' },
    language: { css: 'app-profile-details .detail-right :nth-child(10)' },
    profileLinkButton: { css: 'app-profile-details .detail-right .title-nickname button' },
    profileEditButton: { css: 'app-profile-details .detail-right #edit-button' },
    logoutButton: { css: 'app-profile-details .detail-right #logout-button' }
  },
  observations: {
    listItems: locate({ css: '.latest-individual-observation' }),
    getItem(num) {
      return locate(this.listItems).at(num);
    },
    withinItem: {
      image: { css: '.individual-image' },
      species: locate({ css: '.detail-label' }).at(1),
      name: { css: 'h3' }
    }
  }
};
