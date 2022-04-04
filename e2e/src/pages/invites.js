module.exports = {
  url: '/profile/invites/',
  components: {
    navigation: { css: 'app-nav' },
    invitesList: { css: 'app-invite-list' }
  },
  invitesList: {
    openInviteList: locate({ css: 'app-invite-list  [data-test-id=item_email]' }),
    acceptedInviteList: locate({ css: 'app-invite-list app-invite-item :nth-child(2)' }),
    getItem(num) {
      return locate(this.listItems).at(num);
    },
    withinItem: {
      image: { css: '.user-image' },
      email: { css: 'h2 #email' },
      subscription: { css: 'app-user-subscription-button' }
    },
    inviteButton: { css: 'app-invite-list button#invite' }
  },
  invitesDialog: {
    textfield: { css: 'app-invite-dialog input#invitemail' },
    sendButton: { css: 'app-invite-dialog button#send' }
  }
};
