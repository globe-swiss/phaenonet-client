Feature('Invites');

Scenario('test component present invites', ({ I, invitesPage }) => {
  I.login();
  I.visit(invitesPage.url);
  I.checkElementsPresent(invitesPage.components);
});

Scenario('test component send invite', ({ I, invitesPage }) => {
  I.login();
  I.visit(invitesPage.url);
  I.click(invitesPage.invitesList.inviteButton);
  I.fillField(invitesPage.invitesDialog.textfield, 'aaazzz@example.com');
  I.click(invitesPage.invitesDialog.sendButton);
  I.see('aaazzz@example.com', invitesPage.invitesList.listItems);
  I.ss();
});
